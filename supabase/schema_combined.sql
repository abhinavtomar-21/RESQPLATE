-- ==========================================
-- RESQPLATE COMPLETE DATABASE SCHEMA & SEED
-- Paste and Run this entire file in Supabase SQL Editor
-- ==========================================

DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.fraud_alerts CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.verification_requests CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
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

-- 2. Verification Requests Table
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    restaurant_name TEXT NOT NULL,
    business_license TEXT,
    fssai_license TEXT,
    gst_number TEXT,
    documents JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id),
    rejection_reason TEXT,
    more_docs_requested TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'INFO',
    is_read BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Donations Table
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES public.profiles(id) NOT NULL,
    food_type TEXT NOT NULL,
    quantity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    pickup_address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    expiry_time TIMESTAMPTZ,
    claimed_by UUID REFERENCES public.profiles(id),
    claimed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Fraud Alerts Table
CREATE TABLE IF NOT EXISTS public.fraud_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.profiles(id) NOT NULL,
    reason TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN',
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID NOT NULL,
    performed_by UUID REFERENCES public.profiles(id),
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_profiles_role;
ALTER TABLE public.profiles ADD CONSTRAINT check_profiles_role CHECK (role IN ('Administrator', 'Restaurant', 'NGO', 'Volunteer'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_profiles_approval_status;
ALTER TABLE public.profiles ADD CONSTRAINT check_profiles_approval_status CHECK (approval_status IN ('PENDING', 'DOCUMENT_REVIEW', 'APPROVED', 'REJECTED', 'MORE_DOCS_REQUESTED', 'SUSPENDED'));

ALTER TABLE public.verification_requests DROP CONSTRAINT IF EXISTS check_vr_status;
ALTER TABLE public.verification_requests ADD CONSTRAINT check_vr_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'MORE_DOCS_REQUESTED'));

ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS check_donations_status;
ALTER TABLE public.donations ADD CONSTRAINT check_donations_status CHECK (status IN ('PENDING', 'CLAIMED', 'COMPLETED', 'CANCELLED'));

ALTER TABLE public.fraud_alerts DROP CONSTRAINT IF EXISTS check_fraud_alerts_status;
ALTER TABLE public.fraud_alerts ADD CONSTRAINT check_fraud_alerts_status CHECK (status IN ('OPEN', 'RESOLVED', 'FALSE_POSITIVE'));

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON public.profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_vr_status ON public.verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_vr_restaurant_id ON public.verification_requests(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON public.fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON public.audit_logs(performed_by);

-- 9. Generic Updated_At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_vr_updated_at ON public.verification_requests;
CREATE TRIGGER update_vr_updated_at BEFORE UPDATE ON public.verification_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_donations_updated_at ON public.donations;
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_fraud_alerts_updated_at ON public.fraud_alerts;
CREATE TRIGGER update_fraud_alerts_updated_at BEFORE UPDATE ON public.fraud_alerts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 10. Handle New Auth User Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, role, name, org_name, phone, approval_status, permission_group
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
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. Approval Change Notification Trigger
CREATE OR REPLACE FUNCTION public.handle_approval_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.approval_status <> OLD.approval_status) THEN
        IF (NEW.approval_status = 'APPROVED') THEN
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (NEW.id, 'Account Approved', 'Your account has been fully approved. You can now access all dashboard features.', 'SYSTEM');
        ELSIF (NEW.approval_status = 'REJECTED') THEN
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (NEW.id, 'Account Rejected', 'Your account application was rejected. Please contact support.', 'SYSTEM');
        ELSIF (NEW.approval_status = 'MORE_DOCS_REQUESTED') THEN
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (NEW.id, 'More Documents Requested', 'We need additional documents to verify your account.', 'SYSTEM');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_approval_change ON public.profiles;
CREATE TRIGGER on_profile_approval_change
  AFTER UPDATE OF approval_status ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_approval_status_change();

-- 12. Row Level Security Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Notifications Policies
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Donations Policies
DROP POLICY IF EXISTS "Logged in users can view donations" ON public.donations;
CREATE POLICY "Logged in users can view donations" ON public.donations FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create donations" ON public.donations;
CREATE POLICY "Users can create donations" ON public.donations FOR INSERT WITH CHECK (auth.uid() = donor_id);

DROP POLICY IF EXISTS "Users can update own donations" ON public.donations;
CREATE POLICY "Users can update own donations" ON public.donations FOR UPDATE USING (auth.uid() = donor_id);

-- Verification Requests Policies
DROP POLICY IF EXISTS "Users can create own verification request" ON public.verification_requests;
CREATE POLICY "Users can create own verification request" ON public.verification_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = restaurant_id);

DROP POLICY IF EXISTS "Users can view own verification request" ON public.verification_requests;
CREATE POLICY "Users can view own verification request" ON public.verification_requests FOR SELECT TO authenticated USING (auth.uid() = restaurant_id);

-- Audit Logs Policies
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert own audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = performed_by);

-- 13. Storage Buckets & Policies
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('restaurant_documents', 'restaurant_documents', false),
  ('ngo_documents', 'ngo_documents', false),
  ('food_images', 'food_images', true),
  ('user_avatars', 'user_avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Restaurants can upload their own documents" ON storage.objects;
CREATE POLICY "Restaurants can upload their own documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'restaurant_documents' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Users can view their own restaurant documents" ON storage.objects;
CREATE POLICY "Users can view their own restaurant documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'restaurant_documents' AND auth.uid() = owner);

DROP POLICY IF EXISTS "NGOs can upload their own documents" ON storage.objects;
CREATE POLICY "NGOs can upload their own documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ngo_documents' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Users can view their own NGO documents" ON storage.objects;
CREATE POLICY "Users can view their own NGO documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'ngo_documents' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Public can view food images" ON storage.objects;
CREATE POLICY "Public can view food images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'food_images');

DROP POLICY IF EXISTS "Authenticated users can upload food images" ON storage.objects;
CREATE POLICY "Authenticated users can upload food images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'food_images' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Public can view user avatars" ON storage.objects;
CREATE POLICY "Public can view user avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'user_avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'user_avatars' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'user_avatars' AND auth.uid() = owner);
