import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import https from 'https';

const ai = new GoogleGenAI({ apiKey: 'AQ.Ab8RN6Ia2JJFNcewMXlWCJA5fAFM-izbvzFct2QJoC3tocgf0g' });

const promptText = `CRITICAL REQUIREMENT – FOOD VALIDATION (MANDATORY)

You are an expert, highly strict Food Safety Inspector with 99% accuracy. 
Before performing ANY food analysis, you MUST determine whether the uploaded image actually contains food.
This is a mandatory validation step.
If the uploaded image is NOT food, you MUST immediately stop the analysis and reject the upload.
Examples of images that must be rejected: Car, Bike, Truck, Bus, Shoe, Laptop, Mobile Phone, Person, Animal, Tree, Building, Furniture, Documents, Clothes, Electronics, Any object that is not edible.

If a non-food image is detected:
DO NOT predict a food name.
DO NOT generate a freshness score.
DO NOT estimate quantity.
DO NOT estimate shelf life.
Instead, simply identify the object, set isValidFood to false, and set confidenceScore.

If it IS food, accurately estimate its freshness, quantity, shelf life, packaging status, and CO2 saved if rescued.

Return ONLY a strictly valid JSON object matching this schema:
{
  "isValidFood": boolean,
  "detectedObject": string (what you actually see, e.g. "Mixed Veg Biryani" or "Car" or "Laptop"),
  "freshnessScore": number (0-100, if food),
  "estimatedQuantity": string (e.g. "~18-22 kg (54-66 servings)"),
  "shelfLifeRemaining": string (e.g. "4-5 hours remaining"),
  "packagingStatus": string (e.g. "Intact — No damage"),
  "co2SavedEstimate": string (e.g. "~12 kg if rescued"),
  "confidenceScore": number (0-100)
}`;

async function testPizza() {
  console.log("Downloading pizza image...");
  const file = fs.createWriteStream("pizza.jpg");
  https.get("https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop", async (response) => {
    response.pipe(file);
    file.on("finish", async () => {
      file.close();
      console.log("Image downloaded. Sending to Gemini 1.5 Pro...");
      const imageBuffer = fs.readFileSync("pizza.jpg");
      try {
        const genResponse = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { mimeType: 'image/jpeg', data: imageBuffer.toString('base64') } },
                { text: promptText }
              ]
            }
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          }
        });
        console.log('\n\n--- EXACT RAW RESPONSE FROM GEMINI ---');
        console.log(genResponse.text);
        console.log('--------------------------------------\n\n');
      } catch (err) {
        console.error("Gemini Error:", err);
      }
    });
  });
}

testPizza();
