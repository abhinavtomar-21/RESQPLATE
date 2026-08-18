import { eventBus, Events } from './eventBus.js';
export class TrustEngine {
    // simulated DB of Trust Profiles
    static profiles = new Map();
    static getProfile(id, type) {
        if (!this.profiles.has(id)) {
            this.profiles.set(id, {
                id,
                type,
                trustScore: 85, // Default good standing
                history: []
            });
        }
        return this.profiles.get(id);
    }
    static updateScore(id, type, delta, reason) {
        const profile = this.getProfile(id, type);
        // Calculate new score, bounded between 0 and 100
        let newScore = profile.trustScore + delta;
        newScore = Math.max(0, Math.min(100, newScore));
        profile.trustScore = newScore;
        profile.history.push({
            timestamp: Date.now(),
            delta,
            reason
        });
        console.log(`📈 [TRUST ENGINE] ${type} (${id}) Score updated by ${delta > 0 ? '+' : ''}${delta}. New Score: ${newScore}. Reason: ${reason}`);
    }
    static initializeListeners() {
        // -------------------------------------------------------------
        // PENALTIES (Decay Events)
        // -------------------------------------------------------------
        eventBus.on(Events.FRAUD_CHECK_FAILED, (data) => {
            // Assuming payload has restaurantId. For MVP, simulated 'rest_1'
            this.updateScore('rest_1', 'RESTAURANT', -15, 'Fraud Check Failed (' + data.flags.join(',') + ')');
        });
        eventBus.on(Events.DONATION_EXPIRED, (data) => {
            // Repeatedly posting food that expires hurts trust
            this.updateScore('rest_1', 'RESTAURANT', -5, 'Donation expired before pickup.');
        });
        // -------------------------------------------------------------
        // REWARDS (Growth Events)
        // -------------------------------------------------------------
        eventBus.on(Events.DELIVERY_CONFIRMED, (data) => {
            // Reward all parties involved in a successful lifecycle
            this.updateScore('rest_1', 'RESTAURANT', +2, 'Successful delivery.');
            if (data.volunteerId)
                this.updateScore(data.volunteerId, 'VOLUNTEER', +5, 'Successfully completed a delivery.');
            if (data.ngoId)
                this.updateScore(data.ngoId, 'NGO', +2, 'Successfully received food.');
        });
    }
    static getTrustScore(id, type) {
        return this.getProfile(id, type).trustScore;
    }
}
