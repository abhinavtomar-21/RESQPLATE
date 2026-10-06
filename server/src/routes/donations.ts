import { Router } from 'express';
import multer from 'multer';
import { donationService } from '../services/donationService.js';
import { RiskEngine } from '../services/riskEngine.js';
import { eventBus, Events } from '../services/eventBus.js';
import { executeAiPipelineWithRetries, invalidateModelCache, aiHealthState } from '../services/aiService.js';

export const donationsRouter = Router();

// GET all donations
donationsRouter.get('/', async (req, res) => {
  try {
    const { status, donor } = req.query;
    let items = await donationService.getDonations();

    if (status && status !== 'All') {
      items = items.filter(d => d.status.toLowerCase() === (status as string).toLowerCase());
    }

    res.json({
      success: true,
      count: items.length,
      donations: items
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const FOOD_CONFIDENCE_THRESHOLD = 0.75; // 75% confidence threshold

// POST analyze food with computer vision AI
donationsRouter.post('/ai-analyze', upload.single('image'), async (req, res) => {
  console.log('\n====================================================');
  console.log('🖼️  [STAGE 1] Food Validation Gate Active');
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    // Supported MIME check
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedMimeTypes.includes(req.file.mimetype.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        status: 'INVALID_IMAGE',
        message: 'Unsupported image format. Please upload JPG, PNG, or WEBP.' 
      });
    }

    console.log(`✅ File attached: ${req.file.originalname} (${req.file.mimetype}, ${Math.round(req.file.size / 1024)}KB)`);
    
    const promptText = `You are a strict food classification and quality inspection AI for ZYVORA.

Your FIRST and MOST IMPORTANT task is to determine if the primary subject in the image is EDIBLE FOOD.

Do NOT assume an image contains food.

If the image contains non-food items (e.g., person, selfie, car, vehicle, pet, animal, laptop, phone, document, screenshot, empty plate, empty container, building, furniture, clothes, landscape, or non-edible object), you MUST classify it as REJECTED_NON_FOOD with foodName = null.

SPECIFIC FOOD IDENTIFICATION RULES:
1. When food is present, identify the MOST SPECIFIC RECOGNIZABLE FOOD NAME possible from visual evidence.
   Examples of specific names: "Chicken Biryani", "Biryani", "Margherita Pizza", "Pizza", "Fried Rice", "Dal", "Roti", "Chapati", "Noodles", "Vegetable Curry", "Paneer Butter Masala", "Samosa", "Dosa", "Idli", "Sandwich", "Burger", "Cake", "Bread", "Salad", "Apples", "Bananas", "Mixed Fruits", "Vegetables", "Milk", "Packaged Food".
2. If multiple foods are clearly visible (e.g. Rice, Dal, Vegetable Curry), list them: "Rice, Dal and Vegetable Curry".
3. NEVER return generic placeholder terms like "Cooked Surplus Meal" or "Surplus Meal Batch" when the actual dish/food can be identified.
4. Do NOT fabricate details that cannot be visually established (e.g., if meat type cannot be visually confirmed, return "Biryani" instead of "Chicken Biryani").
5. If food is present but the specific dish cannot be identified, return a reasonable category name such as "Rice Dish", "Indian Curry", "Mixed Food", "Fruit", "Vegetables", or "Bakery Item".
6. If the image is blurry, dark, or ambiguous to classify: set status to "LOW_CONFIDENCE", isFood = false, foodName = null.

Return ONLY a strict JSON object following this exact structure:

For Food Images:
{
  "status": "VALID_FOOD",
  "isFood": true,
  "foodCategory": "cooked_meal",
  "foodName": "Chicken Biryani",
  "foodConfidence": 0.95,
  "reason": "Visible prepared biryani dish with rice and spices.",
  "freshnessScore": 90,
  "freshnessConfidence": 0.88,
  "visualIndicators": ["Normal color", "No visual spoilage"],
  "estimatedShelfLifeHours": 4,
  "limitations": ["Visual analysis cannot confirm microbiological safety."]
}

For Non-Food Images:
{
  "status": "REJECTED_NON_FOOD",
  "isFood": false,
  "foodCategory": "non_food",
  "foodName": null,
  "detectedObject": "Laptop",
  "foodConfidence": 0.98,
  "reason": "The image contains a non-food object and no edible food is detected."
}

CRITICAL RULES:
1. Never fabricate weight (kg), servings count, or CO2 savings in the response.
2. If isFood is false, foodName MUST be null and status MUST be REJECTED_NON_FOOD or LOW_CONFIDENCE.
3. Return raw JSON only. No markdown formatting.`;

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    
    let parsedResult: any = null;
    let finalPipelineResult: any = null;

    try {
      finalPipelineResult = await executeAiPipelineWithRetries(base64Image, mimeType, promptText);
      
      let cleanJson = finalPipelineResult.content.trim();
      if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
      if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
      if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      cleanJson = cleanJson.trim();
      
      parsedResult = JSON.parse(cleanJson);
    } catch (error: any) {
      console.error('⚠️ AI Parsing error:', error.message);
      return res.status(500).json({
        success: false,
        status: 'AI_ERROR',
        message: 'AI analysis is temporarily unavailable. Please try again.'
      });
    }

    // Standardize detection fields
    const isFood = Boolean(parsedResult.isFood || parsedResult.containsFood);
    const confidenceRatio = typeof parsedResult.foodConfidence === 'number' ? parsedResult.foodConfidence : (typeof parsedResult.detectionConfidence === 'number' ? parsedResult.detectionConfidence / 100 : 0.90);
    const confidencePct = Math.round(confidenceRatio * 100);

    // Check for LOW_CONFIDENCE status from AI response or low threshold
    if (parsedResult.status === 'LOW_CONFIDENCE' || (isFood && confidenceRatio < 0.50)) {
      console.log(`⚠️ [GATE LOW CONFIDENCE] Food detection confidence low: ${confidencePct}%`);
      return res.json({
        success: true,
        status: 'LOW_CONFIDENCE',
        isValidFood: false,
        foodName: null,
        detectedObject: parsedResult.detectedObject || 'Uncertain Subject',
        confidenceScore: confidencePct,
        reason: parsedResult.reason || 'Food presence could not be identified with sufficient confidence. Please upload a clearer image.'
      });
    }

    // 🛑 HARD GATE 1: Check if non-food
    if (!isFood || confidenceRatio < FOOD_CONFIDENCE_THRESHOLD) {
      console.log(`🛑 [GATE REJECTED] Image is NOT food or confidence below threshold. Confidence: ${confidencePct}%`);
      return res.json({
        success: true,
        status: 'REJECTED_NON_FOOD',
        isValidFood: false,
        foodName: null,
        detectedObject: parsedResult.detectedObject || 'Non-Food Item',
        confidenceScore: confidencePct,
        reason: parsedResult.reason || 'The uploaded image does not appear to contain recognizable food.'
      });
    }

    // 🟢 VALID FOOD APPROVED
    console.log(`🟢 [GATE APPROVED] Valid Food Detected: "${parsedResult.foodName}" (${confidencePct}% confidence)`);

    const freshness = typeof parsedResult.freshnessScore === 'number' ? Math.min(100, Math.max(0, parsedResult.freshnessScore)) : 90;

    res.json({
      success: true,
      status: 'VALID_FOOD',
      isValidFood: true,
      foodName: parsedResult.foodName || 'Surplus Food Meal',
      detectedObject: parsedResult.foodName || 'Surplus Food Meal',
      freshnessScore: freshness,
      confidenceScore: confidencePct,
      shelfLifeHours: parsedResult.estimatedShelfLifeHours || 4,
      visualIndicators: parsedResult.visualIndicators || ["Normal visual appearance", "No obvious spoilage visible"],
      limitations: parsedResult.limitations || ["Visual analysis cannot confirm microbiological safety."]
    });
  } catch (error: any) {
    console.error('❌ FATAL AI Pipeline Error:', error);
    res.status(500).json({ 
      success: false, 
      status: 'AI_ERROR',
      message: 'AI service temporarily unavailable. Please try again.' 
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH donation status
donationsRouter.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, ngo, volunteerName } = req.body;

  try {
    const updates: any = {};
    if (status) updates.status = status;
    if (ngo) updates.ngoName = ngo; // adjust to db column
    if (volunteerName) updates.volunteerName = volunteerName;

    const updatedDonation = await donationService.updateDonation(id, updates);

    res.json({
      success: true,
      donation: updatedDonation
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

