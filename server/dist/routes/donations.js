import { Router } from 'express';
import multer from 'multer';
import { donationService } from '../services/donationService.js';
import { RiskEngine } from '../services/riskEngine.js';
import { eventBus, Events } from '../services/eventBus.js';
import { executeAiPipelineWithRetries, invalidateModelCache } from '../services/aiService.js';
export const donationsRouter = Router();
// GET all donations
donationsRouter.get('/', async (req, res) => {
    try {
        const { status, donor } = req.query;
        let items = await donationService.getDonations();
        if (status && status !== 'All') {
            items = items.filter(d => d.status.toLowerCase() === status.toLowerCase());
        }
        res.json({
            success: true,
            count: items.length,
            donations: items
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
const upload = multer({ storage: multer.memoryStorage() });
// POST analyze food with computer vision AI
donationsRouter.post('/ai-analyze', upload.single('image'), async (req, res) => {
    console.log('\n====================================================');
    console.log('🖼️  [STAGE 1] Image Upload Received on Backend');
    try {
        if (!req.file) {
            console.log('❌ Error: No image uploaded in the request.');
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }
        console.log(`✅ File attached: ${req.file.originalname} (MIME: ${req.file.mimetype}, Size: ${req.file.size} bytes)`);
        const promptText = `You are a professional food inspection AI.

Analyze ONLY the uploaded image.

First determine whether the primary object is edible food.

If the image contains food:
Return structured JSON like:
{
  "containsFood": true,
  "foodName": "Margherita Pizza",
  "vegNonVeg": "Vegetarian",
  "freshnessScore": 96,
  "ingredients": [],
  "quantity": "",
  "packaging": "",
  "detectionConfidence": 98,
  "qualityConfidence": 99,
  "packagingConfidence": 85,
  "reasoning": [
    "Detected round dough base with tomato sauce",
    "Visible melted cheese and basil"
  ],
  "freshnessReasoning": "No visible discoloration, steam detected."
}

If the image contains anything else (e.g. Car, Bike, Person, Laptop, Shoe):
Return structured JSON like:
{
  "containsFood": false,
  "detectedObject": "Sports Car",
  "detectionConfidence": 99,
  "reasoning": ["Metallic exterior", "Wheels detected", "Inedible object"]
}

Never guess. Never hallucinate.
Return JSON only.`;
        const base64Image = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;
        // Strict Validation Loop
        let parsedResult = null;
        let maxParseRetries = 2;
        let parseAttempt = 0;
        let finalPipelineResult = null;
        while (parseAttempt <= maxParseRetries) {
            try {
                finalPipelineResult = await executeAiPipelineWithRetries(base64Image, mimeType, promptText);
                let cleanJson = finalPipelineResult.content.trim();
                if (cleanJson.startsWith('```json'))
                    cleanJson = cleanJson.substring(7);
                if (cleanJson.startsWith('```'))
                    cleanJson = cleanJson.substring(3);
                if (cleanJson.endsWith('```'))
                    cleanJson = cleanJson.substring(0, cleanJson.length - 3);
                cleanJson = cleanJson.trim();
                parsedResult = JSON.parse(cleanJson);
                if (parsedResult.containsFood !== undefined) {
                    parsedResult.isValidFood = parsedResult.containsFood;
                }
                if (parsedResult.foodName && !parsedResult.detectedObject) {
                    parsedResult.detectedObject = parsedResult.foodName;
                }
                if (parsedResult.freshness && !parsedResult.freshnessScore) {
                    parsedResult.freshnessScore = parsedResult.freshness;
                }
                break; // Success! Break out of the validation loop.
            }
            catch (error) {
                console.error(`⚠️ JSON Validation or Pipeline Failed (Attempt ${parseAttempt}):`, error.message);
                invalidateModelCache(); // Invalidate cache if model produces garbage
                parseAttempt++;
                if (parseAttempt > maxParseRetries) {
                    // If it's a structural pipeline failure, we throw
                    if (error.message.includes('All providers failed')) {
                        throw error;
                    }
                    throw new Error('AI returned invalid JSON multiple times.');
                }
            }
        }
        if (!parsedResult || !finalPipelineResult) {
            throw new Error('Unexpected empty result after pipeline.');
        }
        console.log('✅ [STAGE 3] Final Validated JSON Result:');
        console.log(JSON.stringify(parsedResult, null, 2));
        // LOGGING REQUIREMENT
        console.log('\n📊 [AI Analytics Log]');
        console.log(`Provider   : ${finalPipelineResult.provider}`);
        console.log(`Model      : ${finalPipelineResult.model}`);
        console.log(`Time       : ${finalPipelineResult.time} sec`);
        console.log(`Confidence : ${parsedResult.confidenceScore}%`);
        console.log('----------------------------------------------------');
        // STRICT VALIDATION ENFORCEMENT: Override if confidence < 90
        if (parsedResult.isValidFood && parsedResult.confidenceScore < 90) {
            console.log('⚠️ Warning: Confidence is below 90%. Overriding isValidFood to false.');
            parsedResult.isValidFood = false;
        }
        // Process Human Checklist
        let humanChecklist = null;
        let riskAssessment = null;
        try {
            if (req.body.checklist) {
                humanChecklist = JSON.parse(req.body.checklist);
            }
            else {
                // simulated checklist if frontend hasn't sent one yet
                humanChecklist = {
                    preparationDate: new Date().toISOString(),
                    preparationTime: "Unknown",
                    storageMethod: "Room Temperature",
                    temperature: "Unknown",
                    timeAtRoomTempMinutes: 0,
                    isSealed: false,
                    ingredients: [],
                    allergens: [],
                    dietary: { vegetarian: false, vegan: false },
                    previouslyServed: false,
                    signsOfContamination: false
                };
            }
            const donorTrustScore = 85; // simulated trust score
            if (parsedResult.isValidFood) {
                riskAssessment = RiskEngine.assessRisk(humanChecklist, parsedResult, donorTrustScore);
                eventBus.emit(Events.RISK_CALCULATED, { donationId: 'TMP-1234', riskAssessment });
            }
        }
        catch (e) {
            console.warn("Could not parse checklist or assess risk", e);
        }
        console.log('📤 [STAGE 5] Sending Final UI Response.');
        console.log('====================================================\n');
        res.json({
            success: true,
            ...parsedResult,
            riskAssessment,
            verificationChecklist: humanChecklist
        });
    }
    catch (error) {
        console.error('❌ FATAL AI Pipeline Error:', error);
        // Completely obscure the provider implementation from the frontend
        res.status(500).json({
            success: false,
            message: 'AI service temporarily unavailable.',
            error: 'Pipeline Error'
        });
    }
});
// POST create donation
donationsRouter.post('/', async (req, res) => {
    try {
        const newDonation = await donationService.addDonation(req.body);
        res.status(201).json({
            success: true,
            message: 'Donation successfully created and matched to NGO.',
            donation: newDonation
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// PATCH donation status
donationsRouter.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, ngo, volunteerName } = req.body;
    try {
        const updates = {};
        if (status)
            updates.status = status;
        if (ngo)
            updates.ngoName = ngo; // adjust to db column
        if (volunteerName)
            updates.volunteerName = volunteerName;
        const updatedDonation = await donationService.updateDonation(id, updates);
        res.json({
            success: true,
            donation: updatedDonation
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
