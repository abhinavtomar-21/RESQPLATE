-- 012_triggers.sql

-- Generate notification when profile approval_status changes
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
