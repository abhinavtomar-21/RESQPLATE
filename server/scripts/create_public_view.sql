-- server/scripts/create_public_view.sql

-- 1. Create a View for Public Business Profiles (to prevent exposing full profiles)
CREATE OR REPLACE VIEW public.public_business_profiles AS
SELECT 
    id,
    org_name,
    role,
    profile_completed
FROM 
    public.profiles
WHERE 
    role IN ('Restaurant', 'NGO') AND approval_status = 'APPROVED';

-- 2. Secure the view
-- Ensure we give proper access to the authenticated role
GRANT SELECT ON public.public_business_profiles TO authenticated;
GRANT SELECT ON public.public_business_profiles TO anon;

-- Note: In Supabase, RLS applies to views if they are security invoker,
-- but by default views run as the creator. To force RLS, we can do:
ALTER VIEW public.public_business_profiles SET (security_invoker = true);
