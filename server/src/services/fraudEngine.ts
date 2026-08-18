import crypto from 'crypto';
import { eventBus, Events } from './eventBus.js';

interface Coordinates {
  lat: number;
  lng: number;
}

interface FraudCheckPayload {
  donationId: string;
  restaurantId: string;
  imageBuffer: Buffer;
  
  // Phase 2: Device & Identity Intelligence
  deviceLocation?: Coordinates;
  registeredLocation: Coordinates;
  deviceFingerprint: string;
  ipAddress: string;
  vpnDetected: boolean;
  activeAccountsOnDevice: number;
  
  // Phase 4: Dynamic Risk
  restaurantTrustScore: number;
}

interface FraudResult {
  passed: boolean;
  score: number; // 0 to 100 (100 = definitely fraud)
  flags: string[];
  explainabilityReport: string[]; // Phase 5
}

export class FraudEngine {
  private static pHashCache = new Set<string>();
  private static velocityCache = new Map<string, number[]>(); // restaurantId -> array of timestamps

  private static MAX_DONATIONS_PER_WINDOW = 4;
  private static VELOCITY_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 hours
  private static MAX_GPS_SPOOF_RADIUS_KM = 0.5; // 500 meters
  
  private static FRAUD_BLOCK_THRESHOLD = 50;

  // Haversine
  private static getDistanceInKm(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371;
    const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
    const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * (Math.PI / 180)) * Math.cos(coord2.lat * (Math.PI / 180)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
  }

  // Phase 1 & 3: simulated Perceptual Hash (Simulates finding visually similar images, not just identical bytes)
  private static calculatePerceptualHash(buffer: Buffer): string {
     // In a real prod environment, use a library like 'phash' or blockhash
     return crypto.createHash('md5').update(buffer).digest('hex').substring(0, 16); 
  }

  // Phase 1 & 3: simulated EXIF Extraction
  private static extractExifAnomaly(buffer: Buffer): boolean {
      // simulated: 5% chance the photo is detected as being taken days ago
      return false; 
  }

  static async analyzeDonation(payload: FraudCheckPayload): Promise<FraudResult> {
    console.log(`\n🛡️ [FRAUD ENGINE V2] Deep Analyzing Donation ${payload.donationId}...`);
    
    let fraudScore = 0;
    const flags: string[] = [];
    const explainabilityReport: string[] = [];

    // ------------------------------------------------------------------
    // Phase 1 & 3: AI-Assisted Image Fraud & Duplication
    // ------------------------------------------------------------------
    const pHash = this.calculatePerceptualHash(payload.imageBuffer);
    if (this.pHashCache.has(pHash)) {
      fraudScore += 80;
      flags.push('PHASH_COLLISION');
      explainabilityReport.push('A visually identical image was uploaded recently (Perceptual Hash Match).');
    } else {
      this.pHashCache.add(pHash);
    }

    if (this.extractExifAnomaly(payload.imageBuffer)) {
      fraudScore += 40;
      flags.push('EXIF_METADATA_ANOMALY');
      explainabilityReport.push('Image metadata indicates the photo was taken >24 hours ago.');
    }

    // ------------------------------------------------------------------
    // Phase 2: Device & Identity Intelligence
    // ------------------------------------------------------------------
    if (!payload.deviceLocation) {
       fraudScore += 10;
       flags.push('MISSING_DEVICE_LOCATION');
       explainabilityReport.push('Device GPS location was not provided by the client.');
    } else {
       const distance = this.getDistanceInKm(payload.deviceLocation, payload.registeredLocation);
       if (distance > this.MAX_GPS_SPOOF_RADIUS_KM) {
         fraudScore += 60;
         flags.push('LOCATION_SPOOFING');
         explainabilityReport.push(`Device is ${distance.toFixed(2)}km away from the registered restaurant address.`);
       }
    }

    if (payload.vpnDetected) {
       fraudScore += 20;
       flags.push('VPN_PROXY_DETECTED');
       explainabilityReport.push('Upload occurred via a known VPN/Proxy IP address.');
    }

    if (payload.activeAccountsOnDevice > 2) {
       fraudScore += 30;
       flags.push('MULTIPLE_ACCOUNTS_DEVICE');
       explainabilityReport.push(`Device fingerprint is associated with ${payload.activeAccountsOnDevice} separate accounts.`);
    }

    // ------------------------------------------------------------------
    // Phase 1: Frequency & Velocity (Rate Limiting)
    // ------------------------------------------------------------------
    const now = Date.now();
    const timestamps = this.velocityCache.get(payload.restaurantId) || [];
    const recentActivity = timestamps.filter(t => (now - t) < this.VELOCITY_WINDOW_MS);
    
    if (recentActivity.length >= this.MAX_DONATIONS_PER_WINDOW) {
       fraudScore += 50;
       flags.push('VELOCITY_LIMIT_EXCEEDED');
       explainabilityReport.push(`Account exceeded safe velocity limit (${recentActivity.length} donations in 4 hours).`);
    }
    
    recentActivity.push(now);
    this.velocityCache.set(payload.restaurantId, recentActivity);

    // ------------------------------------------------------------------
    // Phase 4: Dynamic Risk (Trust Score Modifier)
    // ------------------------------------------------------------------
    if (payload.restaurantTrustScore < 40) {
       fraudScore += 20;
       flags.push('LOW_TRUST_SCORE');
       explainabilityReport.push(`Restaurant has a historically poor trust score (${payload.restaurantTrustScore}/100).`);
    } else if (payload.restaurantTrustScore > 90) {
       // High trust reduces fraud score slightly
       fraudScore = Math.max(0, fraudScore - 15);
    }

    // ------------------------------------------------------------------
    // Phase 5: Explainability & Final Decision
    // ------------------------------------------------------------------
    const passed = fraudScore < this.FRAUD_BLOCK_THRESHOLD;

    if (!passed) {
       console.log(`⛔ [FRAUD ENGINE] Blocked Donation ${payload.donationId} (Score: ${fraudScore})`);
       console.log(`   📝 Explainability Report:`);
       explainabilityReport.forEach(r => console.log(`      - ${r}`));
       
       eventBus.emit(Events.FRAUD_CHECK_FAILED, { 
           donationId: payload.donationId, 
           flags, 
           fraudScore,
           explainabilityReport 
       });
    } else {
       console.log(`✅ [FRAUD ENGINE] Cleared Donation ${payload.donationId} (Score: ${fraudScore})`);
       eventBus.emit(Events.FRAUD_CHECK_PASSED, { donationId: payload.donationId });
    }

    return { passed, score: fraudScore, flags, explainabilityReport };
  }
}

