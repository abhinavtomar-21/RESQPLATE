-- 001_profiles.sql

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'Restaurant',
    name TEXT,
    org_name TEXT,
    phone TEXT,
    approval_status TEXT NOT NULL DEFAULT 'DOCUMENT_REVIEW',
    profile_completed BOOLEAN NOT NULL DEFAULT false,
    documents_uploaded BOOLEAN NOT NULL DEFAULT false,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    mfa_verified BOOLEAN NOT NULL DEFAULT false,
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    permission_group TEXT,
    rejection_reason TEXT,
    more_docs_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to auto-create profile on Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    role,
    name,
    org_name,
    phone,
    approval_status,
    permission_group
  )
  VALUES (
    new.id, 
    new.email, 
    COALESCE((new.raw_user_meta_data->>'role'), 'Restaurant'),
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'org_name',
    new.raw_user_meta_data->>'phone',
    COALESCE((new.raw_user_meta_data->>'status'), 'DOCUMENT_REVIEW'),
    CASE 
      WHEN (new.raw_user_meta_data->>'role') = 'Restaurant' THEN 'Restaurant Owner'
      WHEN (new.raw_user_meta_data->>'role') = 'NGO' THEN 'NGO Admin'
      WHEN (new.raw_user_meta_data->>'role') = 'Volunteer' THEN 'Volunteer'
      ELSE 'Restaurant Owner'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to update 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
