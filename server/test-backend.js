import fs from 'fs';
import https from 'https';

const API_URL = 'http://localhost:5000/api/donations/ai-analyze';

async function testBackend() {
  console.log("Downloading pizza image for backend test...");
  const file = fs.createWriteStream("pizza_test_backend.jpg");
  https.get("https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop", async (response) => {
    response.pipe(file);
    file.on("finish", async () => {
      file.close();
      console.log("Image downloaded. Sending to localhost:5000/api/donations/ai-analyze...");
      
      const imageBuffer = fs.readFileSync("pizza_test_backend.jpg");
      
      const formData = new FormData();
      formData.append('image', new Blob([imageBuffer], { type: 'image/jpeg' }), 'pizza_test.jpg');
      
      try {
        const fetchResponse = await fetch(API_URL, {
            method: 'POST',
            body: formData
          });

        const data = await fetchResponse.json();
        console.log('\n\n--- EXACT RESPONSE FROM BACKEND PIPELINE ---');
        console.log(JSON.stringify(data, null, 2));
        console.log('--------------------------------------------\n\n');
        
        // Also check health
        const healthRes = await fetch('http://localhost:5000/api/health/ai');
        console.log('--- AI HEALTH STATUS ---');
        console.log(await healthRes.json());
      } catch (err) {
        console.error("Fetch Error:", err);
      }
    });
  });
}

testBackend();
