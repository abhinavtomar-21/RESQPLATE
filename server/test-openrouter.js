import fs from 'fs';
import https from 'https';

const OPENROUTER_API_KEY = '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';

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
  const file = fs.createWriteStream("pizza_test.jpg");
  https.get("https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop", async (response) => {
    response.pipe(file);
    file.on("finish", async () => {
      file.close();
      console.log("Image downloaded. Sending to OpenRouter...");
      const imageBuffer = fs.readFileSync("pizza_test.jpg");
      const base64Image = imageBuffer.toString('base64');
      const mimeType = 'image/jpeg';
      
      try {
        const fetchResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'ResqPlate',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
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
            })
          });

        if (!fetchResponse.ok) {
            console.error("OpenRouter Error:", fetchResponse.status, await fetchResponse.text());
            return;
        }
        const data = await fetchResponse.json();
        console.log('\n\n--- EXACT RAW RESPONSE FROM OPENROUTER ---');
        console.log(data.choices[0].message.content);
        console.log('--------------------------------------\n\n');
      } catch (err) {
        console.error("Fetch Error:", err);
      }
    });
  });
}

testPizza();
