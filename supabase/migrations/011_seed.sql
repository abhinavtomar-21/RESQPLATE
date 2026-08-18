-- 011_seed.sql

-- For Supabase Auth, you normally shouldn't seed auth.users manually unless using specific deterministic UUIDs,
-- but for local development / testing, we can insert directly if needed. 
-- However, since Supabase heavily relies on GoTrue, the best way to seed is often via the application. 
-- Assuming we DO want to hardcode 4 deterministic users for testing purposes, we do it here:

DO $$
DECLARE
    admin_id UUID := '00000000-0000-0000-0000-000000000001';
    rest_id  UUID := '00000000-0000-0000-0000-000000000002';
    ngo_id   UUID := '00000000-0000-0000-0000-000000000003';
    vol_id   UUID := '00000000-0000-0000-0000-000000000004';
BEGIN
    -- Only insert if they don't exist
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_id) THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
        VALUES (
            admin_id, '00000000-0000-0000-0000-000000000000', 'admin@resqplate.com', 
            crypt('admin123', gen_salt('bf')), NOW(), 
            '{"provider": "email", "providers": ["email"]}', '{"role": "Administrator", "name": "Super Admin"}',
            NOW(), NOW(), '', '', '', ''
        );
        -- Profile is automatically created by the trigger, we just need to update it
        UPDATE public.profiles SET role = 'Administrator', approval_status = 'APPROVED', email_verified = true, profile_completed = true, onboarding_completed = true WHERE id = admin_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = rest_id) THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
        VALUES (
            rest_id, '00000000-0000-0000-0000-000000000000', 'restaurant@resqplate.com', 
            crypt('password123', gen_salt('bf')), NOW(), 
            '{"provider": "email", "providers": ["email"]}', '{"role": "Restaurant", "name": "Joe''s Diner", "org_name": "Joe''s Diner"}',
            NOW(), NOW(), '', '', '', ''
        );
        UPDATE public.profiles SET approval_status = 'APPROVED', email_verified = true, profile_completed = true, documents_uploaded = true, onboarding_completed = true WHERE id = rest_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = ngo_id) THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
        VALUES (
            ngo_id, '00000000-0000-0000-0000-000000000000', 'ngo@resqplate.com', 
            crypt('password123', gen_salt('bf')), NOW(), 
            '{"provider": "email", "providers": ["email"]}', '{"role": "NGO", "name": "Food Rescue Shelter", "org_name": "Food Rescue Shelter"}',
            NOW(), NOW(), '', '', '', ''
        );
        UPDATE public.profiles SET approval_status = 'APPROVED', email_verified = true, profile_completed = true, documents_uploaded = true, onboarding_completed = true WHERE id = ngo_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = vol_id) THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
        VALUES (
            vol_id, '00000000-0000-0000-0000-000000000000', 'volunteer@resqplate.com', 
            crypt('password123', gen_salt('bf')), NOW(), 
            '{"provider": "email", "providers": ["email"]}', '{"role": "Volunteer", "name": "Alice Smith"}',
            NOW(), NOW(), '', '', '', ''
        );
        UPDATE public.profiles SET approval_status = 'APPROVED', email_verified = true, profile_completed = true, documents_uploaded = true, onboarding_completed = true WHERE id = vol_id;
    END IF;
END $$;
