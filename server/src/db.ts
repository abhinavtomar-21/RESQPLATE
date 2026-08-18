import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Direct pg pool for transactions
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

export interface VerificationChecklist {
  preparationDate: string;
  preparationTime: string;
  storageMethod: string;
  temperature: string;
  timeAtRoomTempMinutes: number;
  isSealed: boolean;
  ingredients: string[];
  allergens: string[];
  dietary: { vegetarian: boolean; vegan: boolean };
  previouslyServed: boolean;
  signsOfContamination: boolean;
}

export interface RiskAssessment {
  score: number; // 0-100
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  factors: string[];
}

export interface UserAccount {
  id: string;
  email: string;
  role: 'Restaurant' | 'NGO' | 'Volunteer' | 'Administrator';
  email_verified: boolean;
  profile_completed: boolean;
  documents_uploaded: boolean;
  approval_status: 'PENDING' | 'DOCUMENT_REVIEW' | 'APPROVED' | 'REJECTED' | 'MORE_DOCS_REQUESTED' | 'SUSPENDED';
  onboarding_completed: boolean;
  created_at: string;
  rejection_reason?: string;
  more_docs_notes?: string;
  name?: string;
  permissionGroup?: string;
}

export interface VerificationRequest {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  user_id?: string;
  role?: 'Restaurant' | 'NGO' | 'Volunteer';
  organization_name?: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  doc_name?: string;
  doc_url?: string;
  documents?: any;
  submitted_at?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MORE_DOCS_REQUESTED';
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  notes?: string;
}

