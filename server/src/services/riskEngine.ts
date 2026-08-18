import { VerificationChecklist, RiskAssessment } from '../db.js';

/**
 * Rules Engine (Business Logic)
 * Evaluates raw facts (Human Checklist + AI Output) against strict business rules.
 * Returns an array of Rule Violations.
 */
export class RulesEngine {
  static evaluate(checklist: VerificationChecklist, aiData: any): string[] {
    const violations: string[] = [];

    // 1. Time at room temperature rule
    if (checklist.timeAtRoomTempMinutes > 120) {
      violations.push('Rule Violation: Food kept at room temperature for over 2 hours.');
    }

    // 2. Sealed packaging rule (if required by strict diet)
    if (checklist.allergens && checklist.allergens.length > 0 && !checklist.isSealed) {
      violations.push('Rule Violation: Food with declared allergens is not in sealed packaging.');
    }

    // 3. Previously served rule
    if (checklist.previouslyServed) {
      violations.push('Rule Violation: Food that was previously served to customers cannot be donated.');
    }

    // 4. Contamination rule
    if (checklist.signsOfContamination) {
      violations.push('Rule Violation: Human donor reported possible signs of contamination.');
    }

    return violations;
  }
}

/**
 * Risk Engine (Decision Engine)
 * Combines AI Observations, Business Rules, and Reputation systems to calculate the final Risk Score (0-100).
 */
export class RiskEngine {
  static assessRisk(
    checklist: VerificationChecklist, 
    aiData: any, 
    donorTrustScore: number
  ): RiskAssessment {
    let score = 0;
    const factors: string[] = [];

    // 1. Evaluate Business Rules
    const ruleViolations = RulesEngine.evaluate(checklist, aiData);
    if (ruleViolations.length > 0) {
      score += (ruleViolations.length * 30); // Heavy penalty for rule violations
      factors.push(...ruleViolations);
    }

    // 2. AI vs Human Mismatch
    // If donor claims vegan, but AI sees meat
    if (checklist.dietary?.vegan && aiData.vegNonVeg === 'Non-Vegetarian') {
      score += 40;
      factors.push('AI/Human Mismatch: Donor claimed Vegan, but AI detected Non-Vegetarian food.');
    }

    // 3. AI Freshness/Spoilage Observation
    if (aiData.freshnessScore && aiData.freshnessScore < 60) {
      score += 25;
      factors.push(`AI Observation: Low visual freshness detected (${aiData.freshnessScore}/100).`);
    }

    // 4. Reputation Impact
    if (donorTrustScore < 70) {
      score += 15;
      factors.push(`Reputation: Donor Trust Score is low (${donorTrustScore}/100).`);
    } else if (donorTrustScore >= 95) {
      score -= 10; // High trust reduces risk
    }

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    // Determine Risk Level
    let level: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    if (score >= 90) level = 'Critical';
    else if (score >= 70) level = 'High';
    else if (score >= 30) level = 'Medium';

    if (score === 0 && factors.length === 0) {
      factors.push('Perfect match. Low risk.');
    }

    return {
      score,
      level,
      factors
    };
  }
}

