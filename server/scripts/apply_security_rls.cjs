const { Client } = require('pg');
require('dotenv').config({ path: 'server/.env' });

async function migrate() {
  const pgClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();

  const sql = `
-- PART 1: RLS AUDIT

-- Admin Document Access
DROP POLICY IF EXISTS "Admin can view all restaurant documents" ON storage.objects;
CREATE POLICY "Admin can view all restaurant documents" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'restaurant_documents' AND (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'Administrator')
  )
);

DROP POLICY IF EXISTS "Admin can view all NGO documents" ON storage.objects;
CREATE POLICY "Admin can view all NGO documents" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'ngo_documents' AND (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'Administrator')
  )
);

-- Audit Logs Read Access
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'Administrator')
);

-- Profile Read Access
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
CREATE POLICY "Authenticated users can read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);


-- PART 2: STORAGE SECURITY (File Validation Trigger)
CREATE OR REPLACE FUNCTION public.check_storage_upload()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bucket_id IN ('restaurant_documents', 'ngo_documents') THEN
    IF (NEW.metadata->>'size')::int > 5242880 THEN
      RAISE EXCEPTION 'File size exceeds the 5MB limit.';
    END IF;
    IF (NEW.metadata->>'mimetype') NOT IN ('application/pdf', 'image/png', 'image/jpeg', 'image/jpg') THEN
      RAISE EXCEPTION 'Invalid file type. Only PDF, PNG, and JPEG are allowed.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_storage_upload ON storage.objects;
CREATE TRIGGER tr_check_storage_upload
BEFORE INSERT ON storage.objects
FOR EACH ROW
EXECUTE FUNCTION public.check_storage_upload();


-- PART 8: DUPLICATE PROTECTION
DROP INDEX IF EXISTS idx_unique_pending_verification;
CREATE UNIQUE INDEX idx_unique_pending_verification 
ON public.verification_requests (restaurant_id) 
WHERE status = 'PENDING';
`;

  try {
    await pgClient.query(sql);
    console.log("Security RLS, Storage Validation, and Duplicate Protection applied successfully.");
  } catch (err) {
    console.error("Failed to apply SQL:", err);
  }
  await pgClient.end();
}

migrate();
