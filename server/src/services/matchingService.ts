import { eventBus, Events } from './eventBus.js';

interface Coordinates {
  lat: number;
  lng: number;
}

interface NGO {
  id: string;
  name: string;
  location: Coordinates;
  capacityMeals: number;
  trustScore: number;
  activeDeliveries: number;
  tags: string[]; 
  isOpen: boolean; // Simplified operating hours check
}

interface Volunteer {
  id: string;
  name: string;
  location: Coordinates;
  trustScore: number;
  vehicleType: 'Bike' | 'Car' | 'Van';
  isAvailable: boolean;
}

interface Donation {
  id: string;
  foodName: string;
  restaurantId: string;
  location: Coordinates;
  quantityMeals: number;
  tags: string[];
  status: string;
  expiresAt: Date; 
}

// ------------------------------------------------------------------------
// V2.1 CONFIGURABLE WEIGHTS
// ------------------------------------------------------------------------
const MatchingConfig = {
  WEIGHT_DISTANCE: 40,
  WEIGHT_CAPACITY: 25,
  WEIGHT_COMPATIBILITY: 15,
  WEIGHT_TRUST: 10,
  WEIGHT_WORKLOAD: 10,
  VOLUNTEER_TIMEOUT_MS: 60000 // 60 seconds
};

function getDistanceInKm(coord1: Coordinates, coord2: Coordinates): number {
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

export class MatchingService {
  private static registeredNGOs: NGO[] = [
    { id: 'ngo_1', name: 'Helping Hands', location: { lat: 28.6150, lng: 77.2200 }, capacityMeals: 100, trustScore: 90, activeDeliveries: 1, tags: ['vegetarian'], isOpen: true },
    { id: 'ngo_2', name: 'Food for All', location: { lat: 28.6050, lng: 77.1950 }, capacityMeals: 50, trustScore: 70, activeDeliveries: 0, tags: [], isOpen: false }, // Closed!
    { id: 'ngo_3', name: 'Far Away Shelter', location: { lat: 28.9000, lng: 77.5000 }, capacityMeals: 200, trustScore: 98, activeDeliveries: 0, tags: ['vegetarian', 'halal'], isOpen: true }
  ];

  private static onlineVolunteers: Volunteer[] = [
    { id: 'vol_1', name: 'Rohan Kumar', location: { lat: 28.6180, lng: 77.2100 }, trustScore: 95, vehicleType: 'Bike', isAvailable: true },
    { id: 'vol_2', name: 'Anjali Singh', location: { lat: 28.6250, lng: 77.2300 }, trustScore: 88, vehicleType: 'Car', isAvailable: true }
  ];

  static findBestNGO(donation: Donation) {
    console.log(`\n🚚 [LOGISTICS ENGINE] Running Weighted Match for Donation ${donation.id}`);
    
    // Check Expiration Priority (If it expires in < 1 hr, bump priority)
    const timeUntilExpiryMs = donation.expiresAt.getTime() - Date.now();
    if (timeUntilExpiryMs < 0) {
       console.warn(`❌ MATCH FAILED: Donation has already expired.`);
       eventBus.emit(Events.DONATION_EXPIRED, { donationId: donation.id });
       return null;
    }
    const isUrgent = timeUntilExpiryMs < 3600000; // < 1 hour
    if (isUrgent) console.log(`⚠️ URGENT: Donation expires very soon. Prioritizing.`);

    // 1. Initial Strict Filter (Must have capacity AND be OPEN)
    const eligibleNGOs = this.registeredNGOs.filter(ngo => ngo.isOpen && ngo.capacityMeals >= donation.quantityMeals);
    if (eligibleNGOs.length === 0) {
      console.warn(`❌ MATCH FAILED: No NGO is open with capacity.`);
      eventBus.emit(Events.MATCHING_FAILED, { donationId: donation.id, reason: 'NO_ELIGIBLE_NGO' });
      return null;
    }

    let searchRadiusKm = 15;
    let scoredNGOs = this.scoreNGOs(eligibleNGOs, donation, searchRadiusKm);

    if (scoredNGOs.length === 0) {
      console.log(`⚠️ No NGOs found within ${searchRadiusKm}km. Expanding search radius to 25km...`);
      searchRadiusKm = 25;
      scoredNGOs = this.scoreNGOs(eligibleNGOs, donation, searchRadiusKm);
    }

    if (scoredNGOs.length === 0) {
      console.warn(`❌ MATCH FAILED: No NGO found even after expanding radius.`);
      eventBus.emit(Events.MATCHING_FAILED, { donationId: donation.id, reason: 'NO_NGO_IN_RADIUS' });
      return null;
    }

    scoredNGOs.sort((a, b) => b.score - a.score);
    const bestMatch = scoredNGOs[0];

    console.log(`✅ [MATCH SUCCESS] Assigned to ${bestMatch.ngo.name} (Score: ${bestMatch.score.toFixed(1)} / 100)`);
    
    // ------------------------------------------------------------------------
    // CAPACITY RESERVATION (Race Condition Prevention)
    // ------------------------------------------------------------------------
    bestMatch.ngo.capacityMeals -= donation.quantityMeals; // Deduct immediately!
    console.log(`🔒 Reserved ${donation.quantityMeals} meals from ${bestMatch.ngo.name}'s capacity.`);

    donation.status = 'NGO_RESERVED';
    eventBus.emit(Events.NGO_RESERVED, {
      ngoId: bestMatch.ngo.id,
      donationId: donation.id,
      reservedUntil: Date.now() + 120000 // 2 minute reservation
    });

    this.assignVolunteer(donation, bestMatch.ngo);
    return bestMatch.ngo;
  }

  private static scoreNGOs(ngos: NGO[], donation: Donation, maxRadius: number) {
    const results = [];
    
    for (const ngo of ngos) {
      const distanceKm = getDistanceInKm(donation.location, ngo.location);
      if (distanceKm > maxRadius) continue;

      // Use Configurable Weights
      const distanceScore = Math.max(0, MatchingConfig.WEIGHT_DISTANCE * (1 - (distanceKm / maxRadius)));
      const capacityRatio = donation.quantityMeals / (ngo.capacityMeals || 1); 
      const capacityScore = MatchingConfig.WEIGHT_CAPACITY * capacityRatio;

      let compatScore = MatchingConfig.WEIGHT_COMPATIBILITY; 
      if (donation.tags && donation.tags.length > 0) {
        const matches = donation.tags.filter(t => ngo.tags.includes(t)).length;
        compatScore = MatchingConfig.WEIGHT_COMPATIBILITY * (matches / donation.tags.length);
      }

      const trustScore = MatchingConfig.WEIGHT_TRUST * (ngo.trustScore / 100);
      const workloadScore = Math.max(0, MatchingConfig.WEIGHT_WORKLOAD - (ngo.activeDeliveries * 5));

      const totalScore = distanceScore + capacityScore + compatScore + trustScore + workloadScore;
      results.push({ ngo, distanceKm, score: totalScore });
    }

    return results;
  }

  static assignVolunteer(donation: Donation, ngo: NGO) {
    console.log(`\n🛵 [VOLUNTEER ASSIGNMENT] Finding driver for Donation ${donation.id}`);
    
    const available = this.onlineVolunteers.filter(v => v.isAvailable);
    if (available.length === 0) return null;

    const scoredVolunteers = available.map(vol => {
      const distanceToPickup = getDistanceInKm(vol.location, donation.location);
      let vehicleScore = 100;
      if (donation.quantityMeals > 50 && vol.vehicleType === 'Bike') vehicleScore = -1000;
      
      const score = (100 - distanceToPickup * 10) + vol.trustScore + vehicleScore;
      return { vol, distanceToPickup, score };
    });

    const validCandidates = scoredVolunteers.filter(v => v.score > 0);
    validCandidates.sort((a, b) => b.score - a.score);

    if (validCandidates.length === 0) return null;

    const bestDriver = validCandidates[0];
    bestDriver.vol.isAvailable = false; // Lock Volunteer
    
    console.log(`✅ [DRIVER ASSIGNED] ${bestDriver.vol.name}. Waiting for acceptance...`);
    
    eventBus.emit(Events.VOLUNTEER_ASSIGNED, {
      volunteerId: bestDriver.vol.id,
      donationId: donation.id,
      ngoId: ngo.id
    });

    // ------------------------------------------------------------------------
    // VOLUNTEER TIMEOUT LOOP
    // ------------------------------------------------------------------------
    setTimeout(() => {
       // In a real system, we check DB if Volunteer actually accepted. 
       // If not, unassign them, mark isAvailable = true, and run assignVolunteer() again.
       console.log(`⏳ [TIMEOUT CHECK] Verifying if ${bestDriver.vol.name} accepted within ${MatchingConfig.VOLUNTEER_TIMEOUT_MS/1000}s...`);
    }, MatchingConfig.VOLUNTEER_TIMEOUT_MS);

    return bestDriver.vol;
  }
}

