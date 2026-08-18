const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  try {
    await client.query(
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS \$\$
BEGIN
  INSERT INTO public.profiles (id, email, role, name, org_name, phone, approval_status, permission_group) VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'role', 'Restaurant'), new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'org_name', new.raw_user_meta_data->>'phone', COALESCE(new.raw_user_meta_data->>'status', 'DOCUMENT_REVIEW'), 'Restaurant Owner') ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;);
    console.log('Trigger updated!');
  } catch (err) {
    console.error('Failed:', err.message);
  }
  await client.end();
}
run();
