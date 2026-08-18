-- down_migrations.sql
-- This script reverses the entire schema setup.
-- Run with caution! It will DROP all tables and data.

-- 12. Drop Triggers
DROP TRIGGER IF EXISTS on_profile_approval_change ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_approval_status_change();

-- 11. Seed Data is automatically removed when tables are dropped.
-- If you want to explicitly delete the seeded auth users:
-- DELETE FROM auth.users WHERE email IN ('admin@resqplate.com', 'restaurant@resqplate.com', 'ngo@resqplate.com', 'volunteer@resqplate.com');

-- 10. Drop Storage Policies & Buckets
DROP POLICY IF EXISTS "Restaurants can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own restaurant documents" ON storage.objects;
DROP POLICY IF EXISTS "NGOs can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own NGO documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can view food images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload food images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view user avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;

DELETE FROM storage.buckets WHERE id IN ('restaurant_documents', 'ngo_documents', 'food_images', 'user_avatars');

-- 09. Drop RLS Policies
-- (Automatically dropped when tables are dropped, but good practice to list them)
DROP POLICY IF EXISTS "Users can create own verification request" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can view own verification request" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;
-- Drop other policies ...

-- 08. Drop Indexes
-- (Automatically dropped when tables are dropped)

-- 07. Drop Constraints
-- (Automatically dropped when tables are dropped)

-- 06 - 01. Drop Tables (in reverse dependency order)
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.fraud_alerts CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.verification_requests CASCADE;

-- Drop Auth Trigger before dropping profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop generic functions
DROP FUNCTION IF EXISTS public.update_updated_at_column();
