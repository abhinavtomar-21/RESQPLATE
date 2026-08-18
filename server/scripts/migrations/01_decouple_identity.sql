-- 1. Create Business Details Tables

CREATE TABLE IF NOT EXISTS public.restaurant_details (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    business_name TEXT NOT NULL,
    street TEXT,
    city TEXT,
    district TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'India',
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    pickup_hours TEXT,
    fssai_number TEXT,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ngo_details (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    organization_name TEXT NOT NULL,
    street TEXT,
    city TEXT,
    district TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'India',
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    operating_hours TEXT,
    registration_number TEXT,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Migrate existing data if applicable
INSERT INTO public.restaurant_details (profile_id, business_name)
SELECT id, COALESCE(org_name, name, 'Unknown Restaurant')
FROM public.profiles
WHERE role = 'Restaurant'
ON CONFLICT (profile_id) DO NOTHING;

INSERT INTO public.ngo_details (profile_id, organization_name)
SELECT id, COALESCE(org_name, name, 'Unknown NGO')
FROM public.profiles
WHERE role = 'NGO'
ON CONFLICT (profile_id) DO NOTHING;

-- 3. Recreate the public business profile view to combine these details
DROP VIEW IF EXISTS public.public_business_profiles;

CREATE OR REPLACE VIEW public.public_business_profiles AS
SELECT 
    p.id as profile_id,
    rd.business_name as display_name,
    p.role,
    rd.city,
    rd.state,
    rd.latitude,
    rd.longitude,
    rd.logo_url
FROM public.profiles p
JOIN public.restaurant_details rd ON p.id = rd.profile_id
WHERE p.role = 'Restaurant' AND p.approval_status = 'APPROVED'
UNION ALL
SELECT 
    p.id as profile_id,
    nd.organization_name as display_name,
    p.role,
    nd.city,
    nd.state,
    nd.latitude,
    nd.longitude,
    nd.logo_url
FROM public.profiles p
JOIN public.ngo_details nd ON p.id = nd.profile_id
WHERE p.role = 'NGO' AND p.approval_status = 'APPROVED';

-- 4. Secure the view and tables
GRANT SELECT ON public.public_business_profiles TO authenticated;
GRANT SELECT ON public.public_business_profiles TO anon;
ALTER VIEW public.public_business_profiles SET (security_invoker = true);

ALTER TABLE public.restaurant_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can update own restaurant details" ON public.restaurant_details FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Users can update own ngo details" ON public.ngo_details FOR UPDATE USING (auth.uid() = profile_id);

-- Optional: Drop name and org_name from profiles once verified working. We will leave them for now to avoid breaking auth inserts immediately without backend updates, but they should be ignored in future code.
