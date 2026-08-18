// Centralized Demo Mode Configuration
import { User } from '../contexts/AuthContext';

// Check environment variable DEMO_MODE or VITE_DEMO_MODE
const envDemo = import.meta.env.VITE_DEMO_MODE ?? import.meta.env.DEMO_MODE;
export const IS_DEMO_MODE_CONFIGURED = envDemo !== 'false';

// Stable Deterministic Demo Accounts for Professor Presentation
export const DEMO_RESTAURANT_USER: User = {
  id: 'demo-restaurant-101',
  email: 'restaurant@resqplate.demo',
  name: 'Green Bowl Restaurant',
  permissionGroup: 'Restaurant Owner',
  status: 'APPROVED',
  mfaVerified: true,
  permissions: ['*'],
  email_verified: true,
  role: 'Restaurant',
  profile_completed: true,
  documents_uploaded: true,
  approval_status: 'APPROVED',
  onboarding_completed: true,
};

export const DEMO_NGO_USER: User = {
  id: 'demo-ngo-202',
  email: 'ngo@resqplate.demo',
  name: 'Hope Foundation',
  permissionGroup: 'NGO Admin',
  status: 'APPROVED',
  mfaVerified: true,
  permissions: ['*'],
  email_verified: true,
  role: 'NGO',
  profile_completed: true,
  documents_uploaded: true,
  approval_status: 'APPROVED',
  onboarding_completed: true,
};

export const DEMO_VOLUNTEER_USER: User = {
  id: 'demo-volunteer-303',
  email: 'volunteer@resqplate.demo',
  name: 'Demo Volunteer',
  permissionGroup: 'Volunteer',
  status: 'APPROVED',
  mfaVerified: true,
  permissions: ['*'],
  email_verified: true,
  role: 'Volunteer',
  profile_completed: true,
  documents_uploaded: true,
  approval_status: 'APPROVED',
  onboarding_completed: true,
};

export const DEMO_ADMIN_USER: User = {
  id: 'demo-admin-000',
  email: 'admin@resqplate.demo',
  name: 'ResQ Admin Overview',
  permissionGroup: 'Super Admin',
  status: 'APPROVED',
  mfaVerified: true,
  permissions: ['*'],
  email_verified: true,
  role: 'Administrator',
  profile_completed: true,
  documents_uploaded: true,
  approval_status: 'APPROVED',
  onboarding_completed: true,
};

// Default fallback mock user
export const MOCK_DEMO_USER: User = DEMO_RESTAURANT_USER;

// Initial Seeded Demo Data
export const INITIAL_DEMO_METRICS = {
  foodSavedKg: 1248,
  mealsDistributed: 3420,
  co2ReducedTons: 2.8,
  activeDonations: 12,
  pendingPickups: 3,
  completedDonations: 48,
  peopleServed: 1450,
  wasteReductionPct: 94,
};

export interface DemoDonationItem {
  id: string;
  food: string;
  category: string;
  kg: string;
  meals: number;
  prepTime: string;
  pickupDeadline: string;
  storageCondition: string;
  location: string;
  freshnessScore: number;
  confidenceScore: number;
  safetyStatus: string;
  aiRecommendation: string;
  ngoName: string;
  ngoDistance: string;
  ngoCapacity: string;
  volunteerName: string;
  volunteerVehicle: string;
  estPickupTime: string;
  status: 'DRAFT' | 'AI_ANALYZED' | 'VERIFIED' | 'NGO_MATCHED' | 'PICKUP_IN_PROGRESS' | 'DELIVERED';
  safetyAnswers?: { [key: string]: boolean };
}

export const INITIAL_DEMO_DONATION: DemoDonationItem = {
  id: 'RSQ-DEMO-909',
  food: 'Vegetable Biryani',
  category: 'Cooked Meal',
  kg: '25 kg',
  meals: 100,
  prepTime: '2 hours ago',
  pickupDeadline: '4 hours',
  storageCondition: 'Refrigerated (below 4°C)',
  location: 'Downtown Hotel & Suites, Main Hall',
  freshnessScore: 92,
  confidenceScore: 96,
  safetyStatus: 'Suitable for Redistribution',
  aiRecommendation: 'Food appears suitable for redistribution subject to required safety verification.',
  ngoName: 'Hope Foundation',
  ngoDistance: '2.4 km',
  ngoCapacity: 'Available (Cap: 150 meals)',
  volunteerName: 'Rohan Kumar',
  volunteerVehicle: 'EV Delivery Van (#DL-04-E-8821)',
  estPickupTime: '20 minutes',
  status: 'DRAFT',
  safetyAnswers: {},
};
