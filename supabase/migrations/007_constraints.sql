-- 007_constraints.sql

ALTER TABLE public.profiles
ADD CONSTRAINT check_profiles_role
CHECK (role IN ('Administrator', 'Restaurant', 'NGO', 'Volunteer'));

ALTER TABLE public.profiles
ADD CONSTRAINT check_profiles_approval_status
CHECK (approval_status IN ('PENDING', 'DOCUMENT_REVIEW', 'APPROVED', 'REJECTED', 'MORE_DOCS_REQUESTED', 'SUSPENDED'));

ALTER TABLE public.verification_requests
ADD CONSTRAINT check_vr_status
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'MORE_DOCS_REQUESTED'));

ALTER TABLE public.donations
ADD CONSTRAINT check_donations_status
CHECK (status IN ('PENDING', 'CLAIMED', 'COMPLETED', 'CANCELLED'));

ALTER TABLE public.fraud_alerts
ADD CONSTRAINT check_fraud_alerts_status
CHECK (status IN ('OPEN', 'RESOLVED', 'FALSE_POSITIVE'));
