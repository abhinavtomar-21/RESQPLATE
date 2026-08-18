import { EventEmitter } from 'events';
class DonationEventBus extends EventEmitter {
}
export const eventBus = new DonationEventBus();
// Define explicit event names (State Machine Transitions)
export const Events = {
    DONATION_CREATED: 'DONATION_CREATED', // When REST API receives a donation
    AI_COMPLETED: 'AI_COMPLETED', // When OpenRouter finishes analysis
    RISK_CALCULATED: 'RISK_CALCULATED', // When Rules & Risk engine score it
    FRAUD_CHECK_PASSED: 'FRAUD_CHECK_PASSED', // When Fraud Engine clears it
    FRAUD_CHECK_FAILED: 'FRAUD_CHECK_FAILED', // When Fraud Engine blocks it
    DONATION_APPROVED: 'DONATION_APPROVED', // When both Risk & Fraud pass
    DONATION_EXPIRED: 'DONATION_EXPIRED', // If unmatched/unpicked within timer
    MATCHING_FAILED: 'MATCHING_FAILED', // If no NGO is found even after expansion
    NOTIFICATION_TRIGGERED: 'NOTIFICATION_TRIGGERED',
    // Strict Logistics State Machine
    NGO_RESERVED: 'NGO_RESERVED', // Locks donation for 2 mins while NGO reviews
    NGO_ACCEPTED: 'NGO_ACCEPTED', // NGO commits to receiving
    VOLUNTEER_ASSIGNED: 'VOLUNTEER_ASSIGNED', // Best volunteer selected and confirmed
    VOLUNTEER_TRAVELLING_TO_PICKUP: 'VOLUNTEER_TRAVELLING_TO_PICKUP',
    FOOD_PICKED_UP: 'FOOD_PICKED_UP',
    VOLUNTEER_TRAVELLING_TO_NGO: 'VOLUNTEER_TRAVELLING_TO_NGO',
    DELIVERY_CONFIRMED: 'DELIVERY_CONFIRMED', // Drop-off with timestamp/photo
    DONATION_COMPLETED: 'DONATION_COMPLETED' // End of lifecycle
};
import { MatchingService } from './matchingService.js';
import { FraudEngine } from './fraudEngine.js';
import { TrustEngine } from './trustEngine.js';
// ------------------------------------------------------------------------
// PIPELINE 1: Risk Engine (Food Safety) ➔ Fraud Engine (Actor Trust)
// ------------------------------------------------------------------------
eventBus.on(Events.RISK_CALCULATED, (data) => {
    if (data.riskAssessment?.level === 'Critical' || data.riskAssessment?.level === 'High') {
        console.warn(`🚨 [EVENT: NOTIFICATION] High Risk Donation detected (ID: ${data.donationId}). Flagging for Admin Review.`);
    }
    else {
        console.log(`✅ [EVENT: RISK] Low/Medium Risk. Passing to Fraud Engine.`);
        // Proceed to Fraud Engine Check
        FraudEngine.analyzeDonation({
            donationId: data.donationId,
            restaurantId: 'rest_1', // simulateded for now
            imageBuffer: Buffer.from('simulated_image_buffer_data_placeholder'),
            deviceLocation: { lat: 28.6200, lng: 77.2150 }, // central delhi
            registeredLocation: { lat: 28.6200, lng: 77.2150 },
            deviceFingerprint: 'device_a1b2c3',
            ipAddress: '192.168.1.1',
            vpnDetected: false,
            activeAccountsOnDevice: 1,
            restaurantTrustScore: TrustEngine.getTrustScore('rest_1', 'RESTAURANT')
        });
    }
});
// ------------------------------------------------------------------------
// PIPELINE 2: Fraud Engine ➔ Matching Engine
// ------------------------------------------------------------------------
eventBus.on(Events.FRAUD_CHECK_PASSED, (data) => {
    console.log(`✅ [EVENT: FRAUD] Passed. Moving to Logistics Matching...`);
    eventBus.emit(Events.DONATION_APPROVED, data);
});
// The Matching Subsystem Listens Here
eventBus.on(Events.DONATION_APPROVED, (data) => {
    // In a real app, you fetch the actual donation from DB here.
    // simulateding the structure for the matching service
    const simulatedDonation = {
        id: data.donationId,
        foodName: 'Verified Food',
        restaurantId: 'rest_1',
        location: { lat: 28.6200, lng: 77.2150 }, // Central Delhi simulated
        quantityMeals: 30, // Usually extracted from AI or human input
        status: 'APPROVED',
        tags: [],
        expiresAt: new Date(Date.now() + 3600000)
    };
    MatchingService.findBestNGO(simulatedDonation);
});
