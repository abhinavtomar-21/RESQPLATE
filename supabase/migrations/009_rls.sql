-- 009_rls.sql

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile. Admins can read all.
CREATE POLICY "Users can read own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Note: In a real system, you might create an `is_admin()` function,
-- but since we handle admin bypass primarily on the backend service layer, 
-- we keep RLS tight and let the service role bypass it for admin routes.

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Notifications: Users can read and update their own notifications
CREATE POLICY "Users can read own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Donations: Anyone can read approved/available donations (depending on logic, maybe only logged in users)
CREATE POLICY "Logged in users can view donations" ON public.donations
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Donations: NGOs can create donations, etc. (handled in service layer often, but here is a base policy)
CREATE POLICY "Users can create donations" ON public.donations
FOR INSERT WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Users can update own donations" ON public.donations
FOR UPDATE USING (auth.uid() = donor_id);

-- Audit logs, Fraud alerts, Verification requests should be fully protected.
-- Fraud alerts rely entirely on the backend service layer.
-- Verification requests: Authenticated users can insert their own request.
CREATE POLICY "Users can create own verification request" ON public.verification_requests
FOR INSERT TO authenticated WITH CHECK (auth.uid() = restaurant_id);

CREATE POLICY "Users can view own verification request" ON public.verification_requests
FOR SELECT TO authenticated USING (auth.uid() = restaurant_id);

-- Audit logs: Authenticated users can insert their own audit logs.
CREATE POLICY "Users can insert own audit logs" ON public.audit_logs
FOR INSERT TO authenticated WITH CHECK (auth.uid() = performed_by);
