import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Health Check State
export const aiHealthState = {
  openRouterConnected: false,
  geminiConnected: false,
  currentProvider: 'OpenRouter',
  currentModel: 'pending_discovery',
  lastError: 'None'
};

// Sleep helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Dynamic Model Discovery
let cachedOpenRouterModel: string | null = null;
let modelFetchTime = 0;

async function getBestFreeVisionModel(): Promise<string> {
  const preferredModels = [
    'google/gemini-2.0-flash-lite-001:free',
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.2-11b-vision-instruct:free',
    'qwen/qwen-2-vl-7b-instruct:free'
  ];

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    if (res.ok) {
      const data = await res.json() as any;
      const freeVisionModels = data.data.filter((m: any) => 
        m.pricing?.prompt === '0' && 
        m.architecture?.modality?.includes('image')
      );

      for (const pref of preferredModels) {
        if (freeVisionModels.some((m: any) => m.id === pref)) {
          return pref;
        }
      }

      if (freeVisionModels.length > 0) {
        return freeVisionModels[0].id;
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not dynamically fetch OpenRouter models. Using primary vision fallback.');
  }

  return 'google/gemini-2.0-flash-lite-001:free'; 
}

// OpenRouter Call (With Timeout)
async function callOpenRouter(base64Image: string, mimeType: string, promptText: string): Promise<{content: string, model: string}> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is missing');

  const modelId = await getBestFreeVisionModel();
  aiHealthState.currentModel = modelId;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'ZYVORA',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: promptText },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as any;
    aiHealthState.openRouterConnected = true;
    return { content: data.choices[0].message.content, model: modelId };
  } catch (err: any) {
    clearTimeout(timeoutId);
    aiHealthState.openRouterConnected = false;
    throw err;
  }
}

// Gemini Call (With Timeout)
async function callGemini(base64Image: string, mimeType: string, promptText: string): Promise<{content: string, model: string}> {
  const modelName = 'gemini-2.0-flash';
  
  // Create AbortController manually for SDK if possible, or just wrap in Promise.race
  const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Gemini API request exceeded 30 seconds')), 30000);
  });

  try {
    const generatePromise = ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: mimeType, data: base64Image } },
            { text: promptText }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    });

    const response = await Promise.race([generatePromise, timeoutPromise]) as any;
    aiHealthState.geminiConnected = true;
    return { content: response.text, model: modelName };
  } catch (err) {
    aiHealthState.geminiConnected = false;
    throw err;
  }
}

// Unified Provider Abstraction with Retry & Validation
export async function executeAiPipelineWithRetries(base64Image: string, mimeType: string, promptText: string) {
  let attempt = 0;
  const maxRetries = 2;

  // Try OpenRouter First
  aiHealthState.currentProvider = 'OpenRouter';
  
  while (attempt <= maxRetries) {
    try {
      if (attempt > 0) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Retrying OpenRouter in ${backoffMs}ms... (Attempt ${attempt}/${maxRetries})`);
        await sleep(backoffMs);
      }
      
      const startTime = Date.now();
      const result = await callOpenRouter(base64Image, mimeType, promptText);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      return { ...result, provider: 'OpenRouter', time: duration };
    } catch (err: any) {
      aiHealthState.lastError = err.message || String(err);
      console.warn(`❌ OpenRouter Attempt ${attempt} Failed:`, aiHealthState.lastError);
      
      // Don't retry if it's an abort error (unless we specifically want to retry timeouts)
      if (err.name === 'AbortError') {
         console.log('⏱️ OpenRouter Request Timed Out.');
      } else if (!aiHealthState.lastError.includes('429') && !aiHealthState.lastError.includes('503') && !aiHealthState.lastError.includes('400')) {
          // If it's 401 or something terminal, break early
          if (aiHealthState.lastError.includes('401')) break;
      }
      attempt++;
    }
  }

  // Fallback to Gemini
  console.log('🔄 Switching to Secondary Provider: Gemini');
  aiHealthState.currentProvider = 'Gemini';
  aiHealthState.currentModel = 'gemini-2.0-flash';
  attempt = 0;

  while (attempt <= 1) { // 1 retry for fallback
    try {
      if (attempt > 0) await sleep(2000);
      
      const startTime = Date.now();
      const result = await callGemini(base64Image, mimeType, promptText);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      return { ...result, provider: 'Gemini', time: duration };
    } catch (err: any) {
      aiHealthState.lastError = err.message || String(err);
      console.warn(`❌ Gemini Attempt ${attempt} Failed:`, aiHealthState.lastError);
      attempt++;
    }
  }

  throw new Error(`All providers failed. Last Error: ${aiHealthState.lastError}`);
}

export function invalidateModelCache() {
  cachedOpenRouterModel = null;
}

