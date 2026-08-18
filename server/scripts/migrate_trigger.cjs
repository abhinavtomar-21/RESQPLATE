const { Client } = require('pg');
require('dotenv').config({ path: 'server/.env' });

async function migrate() {
  const pgClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();

  const sql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent Administrator registration publicly
  IF (new.raw_user_meta_data->>'role') = 'Administrator' THEN
      RAISE EXCEPTION 'Administrator registration is not permitted via public sign-up.';
  END IF;
  
  -- Prevent completely invalid roles to avoid 500 constraint violations
  IF (new.raw_user_meta_data->>'role') NOT IN ('Restaurant', 'NGO', 'Volunteer') THEN
      RAISE EXCEPTION 'Invalid role specified for public registration.';
  END IF;

  INSERT INTO public.profiles (
    id, email, role, name, org_name, phone, approval_status, permission_group
  )
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'role',
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
`;
  await pgClient.query(sql);
  console.log("Trigger updated.");
  await pgClient.end();
}

migrate();
