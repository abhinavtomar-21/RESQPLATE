const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
  await client.connect();
  try {
    const query = `
      CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (
          id, email, role, name, org_name, phone, approval_status, permission_group
        )
        VALUES (
          new.id, 
          new.email, 
          COALESCE(new.raw_user_meta_data->>'role', 'Restaurant'),
          new.raw_user_meta_data->>'name',
          new.raw_user_meta_data->>'org_name',
          new.raw_user_meta_data->>'phone',
          COALESCE(new.raw_user_meta_data->>'status', 'DOCUMENT_REVIEW'),
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
    await client.query(query);
    console.log('Successfully updated trigger function!');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.end();
  }
}

run();
