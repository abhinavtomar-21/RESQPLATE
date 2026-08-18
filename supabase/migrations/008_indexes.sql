-- 008_indexes.sql

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON public.profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- verification_requests
CREATE INDEX IF NOT EXISTS idx_vr_status ON public.verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_vr_restaurant_id ON public.verification_requests(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_vr_created_at ON public.verification_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_vr_deleted_at ON public.verification_requests(deleted_at);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- donations
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_deleted_at ON public.donations(deleted_at);

-- fraud_alerts
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_restaurant_id ON public.fraud_alerts(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON public.fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_deleted_at ON public.fraud_alerts(deleted_at);

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON public.audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON public.audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
