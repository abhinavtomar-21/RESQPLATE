import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function setupDB() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    const sql = `
      -- 1. Create Profiles Table
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT,
        org_name TEXT,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'Restaurant',
        permission_group TEXT,
        status TEXT NOT NULL DEFAULT 'APPROVED',
        approval_status TEXT NOT NULL DEFAULT 'APPROVED',
        email_verified BOOLEAN DEFAULT false,
        mfa_verified BOOLEAN DEFAULT false,
        profile_completed BOOLEAN DEFAULT false,
        documents_uploaded BOOLEAN DEFAULT false,
        onboarding_completed BOOLEAN DEFAULT false,
        rejection_reason TEXT,
        more_docs_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 2. Create Verification Requests Table
      CREATE TABLE IF NOT EXISTS public.verification_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        organization_name TEXT NOT NULL,
        user_name TEXT,
        user_email TEXT,
        user_phone TEXT,
        doc_name TEXT,
        doc_url TEXT,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status TEXT NOT NULL DEFAULT 'PENDING',
        reviewed_by TEXT,
        reviewed_at TIMESTAMP WITH TIME ZONE,
        rejection_reason TEXT,
        notes TEXT
      );

      -- Enable RLS
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

      -- Create Policies for Profiles
      DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
      CREATE POLICY "Users can view own profile" ON public.profiles 
        FOR SELECT USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
      CREATE POLICY "Users can update own profile" ON public.profiles 
        FOR UPDATE USING (auth.uid() = id);

      -- Allow inserting into profiles for the trigger
      DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
      CREATE POLICY "Service role can manage profiles" ON public.profiles 
        USING (true); -- Only used by service role or triggers

      -- Create Policies for Verification Requests
      DROP POLICY IF EXISTS "Users can insert own requests" ON public.verification_requests;
      CREATE POLICY "Users can insert own requests" ON public.verification_requests 
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can view own requests" ON public.verification_requests;
      CREATE POLICY "Users can view own requests" ON public.verification_requests 
        FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Service role can manage requests" ON public.verification_requests;
      CREATE POLICY "Service role can manage requests" ON public.verification_requests 
        USING (true);

      -- Create Trigger to automatically populate profiles on signup
      CREATE OR REPLACE FUNCTION public.handle_new_user() 
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (
          id, email, name, org_name, phone, role, permission_group, 
          status, approval_status, onboarding_completed, documents_uploaded, profile_completed
        )
        VALUES (
          new.id, 
          new.email,
          new.raw_user_meta_data->>'name',
          new.raw_user_meta_data->>'orgName',
          new.raw_user_meta_data->>'phone',
          COALESCE(new.raw_user_meta_data->>'role', 'Restaurant'),
          COALESCE(new.raw_user_meta_data->>'role', 'Restaurant Owner'),
          COALESCE(new.raw_user_meta_data->>'status', 'DOCUMENT_REVIEW'),
          COALESCE(new.raw_user_meta_data->>'status', 'DOCUMENT_REVIEW'),
          CASE WHEN new.raw_user_meta_data->>'role' = 'Volunteer' THEN true ELSE false END,
          CASE WHEN new.raw_user_meta_data->>'role' = 'Volunteer' THEN true ELSE false END,
          false
        );
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

    `;

    await client.query(sql);
    console.log("Database schema deployed successfully.");
  } catch (err) {
    console.error("Error setting up DB:", err);
  } finally {
    await client.end();
  }
}

setupDB();

