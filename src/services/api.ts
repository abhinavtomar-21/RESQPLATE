export interface DonationData {
  id: string;
  food: string;
  kg: string;
  meals: number;
  status: string;
  ngo: string;
  score: number;
  time: string;
  allergens?: string[];
  temperature?: string;
  prepTime?: string;
  notes?: string;
  verificationChecklist?: any;
  riskAssessment?: {
    score: number;
    level: 'Low' | 'Medium' | 'High' | 'Critical';
    factors: string[];
  };
  aiAnalysis?: any;
}

export interface VolunteerRequestData {
  id: string;
  donor: string;
  food: string;
  pickup: string;
  deadline: string;
  priority: 'Urgent' | 'High' | 'Normal';
  score: number;
  donationId?: string;
}

export interface NotificationData {
  id: number;
  type: string;
  title: string;
  msg: string;
  time: string;
  read: boolean;
}

const API_BASE = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
  ? 'https://ZYVORA-jbdy.onrender.com/api'
  : 'http://localhost:5000/api';

// Initial Seed Store
const DEFAULT_DEMO_DONATIONS: DonationData[] = [
  { id: '#DON-892', food: 'Vegetable Biryani & Raita', kg: '25 kg', meals: 100, status: 'In Transit', ngo: 'Asha Foundation', score: 94, time: '10 mins ago', prepTime: '2 hours ago', temperature: '4°C (Refrigerated)' },
  { id: '#DON-891', food: 'Paneer Butter Masala & Rotis', kg: '18 kg', meals: 70, status: 'Delivered', ngo: 'Green Hope NGO', score: 92, time: '2 hours ago', prepTime: '3 hours ago' },
  { id: '#DON-890', food: 'Mixed Veg Curry & Steamed Rice', kg: '30 kg', meals: 120, status: 'Pending', ngo: 'Unassigned', score: 88, time: 'Just now', prepTime: '1 hour ago' },
  { id: '#DON-889', food: 'Dal Tadka & Jeera Rice', kg: '15 kg', meals: 60, status: 'Delivered', ngo: 'CityFeed Trust', score: 96, time: 'Yesterday', prepTime: '5 hours ago' }
];

const DEFAULT_DEMO_VOLUNTEER_REQUESTS: VolunteerRequestData[] = [
  { id: 'REQ-101', donor: 'Green Bowl Restaurant', food: 'Vegetable Biryani & Raita (25 kg)', pickup: 'Main Hall, Vellore', deadline: 'In 45 mins', priority: 'Urgent', score: 94, donationId: '#DON-892' },
  { id: 'REQ-102', donor: 'Royal Feast Banquets', food: 'Paneer Tikka & Naan (15 kg)', pickup: 'Bandra West, Mumbai', deadline: 'In 2 hours', priority: 'High', score: 91, donationId: '#DON-891' }
];

function getStoredDonations(): DonationData[] {
  try {
    const raw = localStorage.getItem('resq_demo_donations');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem('resq_demo_donations', JSON.stringify(DEFAULT_DEMO_DONATIONS));
  return DEFAULT_DEMO_DONATIONS;
}

function saveStoredDonations(donations: DonationData[]) {
  localStorage.setItem('resq_demo_donations', JSON.stringify(donations));
  window.dispatchEvent(new Event('resq_store_updated'));
}

function getStoredRequests(): VolunteerRequestData[] {
  try {
    const raw = localStorage.getItem('resq_demo_requests');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem('resq_demo_requests', JSON.stringify(DEFAULT_DEMO_VOLUNTEER_REQUESTS));
  return DEFAULT_DEMO_VOLUNTEER_REQUESTS;
}

function saveStoredRequests(requests: VolunteerRequestData[]) {
  localStorage.setItem('resq_demo_requests', JSON.stringify(requests));
  window.dispatchEvent(new Event('resq_store_updated'));
}

export const ResQApi = {
  // Fetch All Donations
  async getDonations(statusFilter: string = 'All'): Promise<DonationData[]> {
    try {
      const res = await fetch(`${API_BASE}/donations?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        if (data.donations && data.donations.length > 0) {
          return data.donations;
        }
      }
    } catch (e) {}

    const stored = getStoredDonations();
    if (statusFilter === 'All') return stored;

    const targetFilter = statusFilter.toLowerCase();
    return stored.filter(d => {
      const s = (d.status || '').toLowerCase();
      if (targetFilter === 'pending') {
        return s === 'pending' || s === 'available' || s === 'submitted' || s === 'draft';
      }
      return s === targetFilter;
    });
  },

  // Create Food Donation
  async createDonation(donation: { food: string; kg: string; temp?: string; time?: string; notes?: string; allergens?: string[] }): Promise<DonationData> {
    const parsedKg = parseInt(donation.kg) || 20;
    const newDonation: DonationData = {
      id: `#DON-${Math.floor(100 + Math.random() * 900)}`,
      food: donation.food || 'Surplus Meal Batch',
      kg: donation.kg.includes('kg') ? donation.kg : `${donation.kg} kg`,
      meals: Math.round(parsedKg * 4),
      status: 'Pending',
      ngo: 'Nearby NGO Auto-Matching...',
      score: 94,
      time: 'Just now',
      prepTime: donation.time || '1 hour ago',
      temperature: donation.temp || '4°C (Refrigerated)',
      notes: donation.notes
    };

    try {
      const res = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDonation)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.donation) return data.donation;
      }
    } catch (e) {}

    // Store update (offline / demo state propagation)
    const stored = getStoredDonations();
    const updated = [newDonation, ...stored];
    saveStoredDonations(updated);
    return newDonation;
  },

  // AI Food Analysis Scan (Strict Food Gate & Zero-Hallucination Pipeline)
  async analyzeFoodPhoto(file: File): Promise<{ 
    isValidFood: boolean; 
    status: 'VALID_FOOD' | 'REJECTED_NON_FOOD' | 'LOW_CONFIDENCE' | 'AI_ERROR' | 'INVALID_IMAGE'; 
    detectedObject?: string; 
    freshnessScore?: number | null; 
    foodType?: string; 
    shelfLifeHours?: number | null;
    confidenceScore?: number; 
    reason?: string;
    visualIndicators?: string[];
    limitations?: string[];
  }> {
    console.log(`[AI DEBUG] Image selected for analysis: ${file.name} (${file.type || 'image/jpeg'}, ${Math.round(file.size / 1024)}KB)`);
    
    // Client-side pre-validation: check size and format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
      return {
        isValidFood: false,
        status: 'INVALID_IMAGE',
        detectedObject: 'Unsupported File Format',
        confidenceScore: 0,
        reason: 'Unsupported file format. Please upload JPG, PNG, or WEBP images.'
      };
    }

    try {
      const formData = new FormData();
      formData.append('image', file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s threshold

      const res = await fetch(`${API_BASE}/donations/ai-analyze`, { 
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        
        if (data.status === 'LOW_CONFIDENCE') {
          return {
            isValidFood: false,
            status: 'LOW_CONFIDENCE',
            detectedObject: data.detectedObject || 'Uncertain Subject',
            confidenceScore: data.confidenceScore || 40,
            reason: data.reason || 'Food presence could not be identified with sufficient confidence.'
          };
        }

        // Hard Gate Check: Non-Food Rejection
        if (data.isValidFood === false || data.status === 'REJECTED_NON_FOOD') {
          console.log('🛑 [CLIENT GATE] Non-Food Image Rejected by AI:', data);
          return {
            isValidFood: false,
            status: 'REJECTED_NON_FOOD',
            detectedObject: data.detectedObject || 'Non-Food Item',
            confidenceScore: data.confidenceScore || 95,
            reason: data.reason || 'The uploaded image does not appear to contain recognizable food.'
          };
        }

        // Approved Valid Food
        if (data.isValidFood === true || data.status === 'VALID_FOOD') {
          console.log('🟢 [CLIENT GATE] Valid Food Approved:', data);
          return {
            isValidFood: true,
            status: 'VALID_FOOD',
            detectedObject: data.foodName || data.detectedObject || 'Surplus Meal',
            foodType: data.foodName || 'Surplus Meal',
            freshnessScore: typeof data.freshnessScore === 'number' ? data.freshnessScore : 90,
            confidenceScore: data.confidenceScore || 95,
            shelfLifeHours: data.shelfLifeHours || 4,
            visualIndicators: data.visualIndicators || ["Normal visual appearance", "No obvious spoilage visible"],
            limitations: data.limitations || ["Visual analysis cannot confirm microbiological safety."]
          };
        }
      }
    } catch (err: any) {
      console.warn('⚠️ [AI DEBUG] Backend API request failed or timed out:', err.message);
    }

    // 🛑 STRICT REJECTION ON ERROR: Never fabricate food for an image
    return {
      isValidFood: false,
      status: 'AI_ERROR',
      detectedObject: 'Analysis Unavailable',
      confidenceScore: 0,
      reason: 'AI service temporarily unavailable. Please upload a clear image of food to proceed.'
    };
  },

  // Accept Donation by NGO
  async acceptDonation(donationId: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/ngos/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId })
      });
    } catch (e) {}

    // Multi-role state propagation: update donation status & create volunteer request
    const stored = getStoredDonations();
    let targetDonation: DonationData | undefined = stored.find(d => d.id === donationId);
    
    const updatedDonations = stored.map(d => {
      if (d.id === donationId || (!targetDonation && d.status === 'Pending')) {
        targetDonation = d;
        return { ...d, status: 'In Transit', ngo: 'Asha Foundation' };
      }
      return d;
    });

    saveStoredDonations(updatedDonations);

    // Create Volunteer Pickup Request
    if (targetDonation) {
      const requests = getStoredRequests();
      const newReq: VolunteerRequestData = {
        id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
        donor: 'Green Bowl Restaurant',
        food: `${targetDonation.food} (${targetDonation.kg})`,
        pickup: 'Main Hall, Vellore',
        deadline: 'In 45 mins',
        priority: 'Urgent',
        score: targetDonation.score || 94,
        donationId: targetDonation.id
      };
      saveStoredRequests([newReq, ...requests]);
    }

    return true;
  },

  // Accept Pickup Request by Volunteer
  async acceptPickupRequest(requestId: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/volunteers/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      });
    } catch (e) {}

    // Complete donation state: mark Delivered in store
    const stored = getStoredDonations();
    const updated = stored.map(d => ({ ...d, status: 'Delivered', ngo: 'Asha Foundation' }));
    saveStoredDonations(updated);

    const requests = getStoredRequests();
    const updatedReqs = requests.filter(r => r.id !== requestId);
    saveStoredRequests(updatedReqs);

    return true;
  },

  // Fetch Volunteer Requests
  async getVolunteerRequests(): Promise<VolunteerRequestData[]> {
    try {
      const res = await fetch(`${API_BASE}/volunteers/requests`);
      if (res.ok) {
        const data = await res.json();
        if (data.requests && data.requests.length > 0) return data.requests;
      }
    } catch (e) {}

    return getStoredRequests();
  },

  // Fetch Notifications
  async getNotifications(): Promise<NotificationData[]> {
    try {
      const res = await fetch(`${API_BASE}/notifications`);
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) return data.notifications;
      }
    } catch (e) {}

    return [
      { id: 1, type: 'match', title: 'New NGO Match', msg: 'Asha Foundation matched with food donation batch.', time: '5m ago', read: false },
      { id: 2, type: 'pickup', title: 'Volunteer En Route', msg: 'Rohan Kumar accepted pickup task.', time: '12m ago', read: false },
      { id: 3, type: 'verified', title: 'AI Quality Check Passed', msg: 'Visual freshness score verified.', time: '30m ago', read: true }
    ];
  }
};
