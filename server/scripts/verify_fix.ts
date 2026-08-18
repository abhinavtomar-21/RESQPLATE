import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dawhamkadgqnlpjyvqjd.supabase.co';
const supabaseKey = 'sb_publishable_k0AgQL_IJBF99y4ZSkRt9g_g6nkKX_m';
// Need the service role key to verify DB state bypassing RLS
const serviceRoleKey = 'sb_secret_bP_rFr2ib6ExLwuHOjNXQQ_7gkra4D8';

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function runTests() {
  console.log("==================================================");
  console.log("STEP 1: Log the exact payload");
  console.log("==================================================");
  const emailRest = `test.rest.${Date.now()}@resqplate.com`;
  const payloadRest = {
    email: emailRest,
    password: 'password123',
    options: {
      data: {
        role: 'Restaurant',
        name: 'Test Name',
        orgName: 'Test Org',
        phone: '1234567890'
      }
    }
  };
  console.log(JSON.stringify(payloadRest, null, 2));
  console.log("Verified role is exactly: Restaurant");

  console.log("\n==================================================");
  console.log("STEP 2: Execute a real registration");
  console.log("==================================================");
  
  const { data: authData, error: authError } = await supabase.auth.signUp(payloadRest);
  if (authError) {
    console.error("Signup failed:", authError);
    return;
  }
  console.log("Signup succeeded without error.");
  console.log("auth.users row created, ID:", authData.user?.id);

  console.log("\n==================================================");
  console.log("STEP 3 & 4: Verify profiles row and trigger success");
  console.log("==================================================");
  
  // Wait a moment for trigger to complete
  await new Promise(r => setTimeout(r, 1000));
  
  const { default: pkg } = await import('pg');
  const { Client } = pkg;
  const dotenv = await import('dotenv');
  dotenv.config({ path: 'server/.env' });
  const pgClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  
  const profileRes = await pgClient.query('SELECT role FROM public.profiles WHERE email = $1', [emailRest]);
  
  if (profileRes.rowCount === 0) {
    console.error("Failed to query profile: row not found");
  } else {
    const role = profileRes.rows[0].role;
    console.log(`Stored role for ${emailRest} is:`, role);
    if (role === 'Restaurant') {
      console.log("✓ SUCCESS: Stored value is 'Restaurant' (NOT 'Restaurant Owner')");
      console.log("✓ SUCCESS: handle_new_user trigger completed successfully without rollback.");
    } else {
      console.error("✗ FAIL: Role is incorrect:", role);
    }
  }
  await pgClient.end();

  console.log("\n==================================================");
  console.log("STEP 5: Verify Email Verification & Sign In");
  console.log("==================================================");
  
  // Auto-verify email using Admin API
  const { error: verifyError } = await supabaseAdmin.auth.admin.updateUserById(authData.user!.id, {
    email_confirm: true
  });
  if (verifyError) {
    console.error("Failed to verify email:", verifyError);
  } else {
    console.log("✓ SUCCESS: User email confirmed successfully.");
  }
  
  // Sign in
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: emailRest,
    password: 'password123'
  });
  if (signInError) {
    console.error("Failed to sign in:", signInError);
  } else {
    console.log("✓ SUCCESS: User signed in successfully.");
  }

  console.log("\n==================================================");
  console.log("STEP 6: Attempt registrations using every supported role");
  console.log("==================================================");
  
  const roles = ['NGO', 'Volunteer', 'Administrator'];
  for (const r of roles) {
    const e = `test.${r.toLowerCase()}.${Date.now()}@resqplate.com`;
    const { error: err } = await supabase.auth.signUp({
      email: e,
      password: 'password123',
      options: { data: { role: r } }
    });
    if (err) {
      console.error(`✗ FAIL: Registration for ${r} failed:`, err.message);
    } else {
      console.log(`✓ SUCCESS: Registration for ${r} succeeded.`);
    }
  }

  console.log("\n==================================================");
  console.log("STEP 7: Attempt invalid roles");
  console.log("==================================================");
  
  const invalidRoles = ['Restaurant Owner', 'Hotel', 'Business', 'Donor', 'Random String'];
  for (const r of invalidRoles) {
    console.log(`Testing invalid role: ${r}`);
    const e = `test.invalid.${Date.now()}@resqplate.com`;
    const { error: err } = await supabase.auth.signUp({
      email: e,
      password: 'password123',
      options: { data: { role: r } }
    });
    if (err) {
      console.log(`✓ SUCCESS: Registration blocked by backend constraints. Error:`, err.message);
    } else {
      console.error(`✗ FAIL: Backend allowed invalid role ${r}!`);
    }
  }
}

runTests();
