const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
require('dotenv').config();
require('dotenv').config({ path: '../.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const pg = new Client({ connectionString: process.env.DATABASE_URL });
async function runTest() {
  try {
    await pg.connect();
    console.log('--- STARTING E2E TEST 1 ---');
    const testEmail = 'e2e_rest_' + Date.now() + '@resqplate.com';
    console.log('1. Registering new Restaurant:', testEmail);
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email: testEmail, password: 'TestPassword123!', options: { data: { role: 'Restaurant', name: 'Test Restaurant', orgName: 'Test Org' } } });
    if (signUpErr) throw signUpErr;
    const userId = signUpData.user.id;
    console.log('2. Simulating Email Verification (via PG update)...');
    await pg.query('UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = $1', [userId]);
    console.log('3. Logging in as Restaurant...');
    const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({ email: testEmail, password: 'TestPassword123!' });
    if (loginErr) throw loginErr;
    console.log('4. Profile Completion & Document Upload...');
    const userSupabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: 'Bearer ' + loginData.session.access_token } } });
    const { error: profileUpdateErr } = await userSupabase.from('profiles').update({ profile_completed: true, documents_uploaded: true, approval_status: 'DOCUMENT_REVIEW', updated_at: new Date().toISOString() }).eq('id', userId);
    if (profileUpdateErr) throw profileUpdateErr;
    const { data: vrData, error: vrErr } = await userSupabase.from('verification_requests').insert({ restaurant_id: userId, restaurant_name: 'Test Org', status: 'PENDING', documents: { url: 'license.pdf' } }).select().single();
    if (vrErr) throw vrErr;
    console.log('5. Admin Login...');
    const { data: adminLoginData, error: adminLoginErr } = await supabase.auth.signInWithPassword({ email: 'masteradmin@resqplate.com', password: 'masterpassword' });
    if (adminLoginErr) throw adminLoginErr;
    const adminSupabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: 'Bearer ' + adminLoginData.session.access_token } } });
    console.log('6. Admin Approves Restaurant...');
    const { error: adminUpdateProfileErr } = await adminSupabase.from('profiles').update({ approval_status: 'APPROVED' }).eq('id', userId);
    if (adminUpdateProfileErr) throw adminUpdateProfileErr;
    const { error: adminUpdateVrErr } = await adminSupabase.from('verification_requests').update({ status: 'APPROVED' }).eq('id', vrData.id);
    if (adminUpdateVrErr) throw adminUpdateVrErr;
    console.log('7. Restaurant verifies approval status...');
    const { data: finalProfile, error: finalProfileErr } = await userSupabase.from('profiles').select('*').eq('id', userId).single();
    if (finalProfileErr) throw finalProfileErr;
    if (finalProfile.approval_status === 'APPROVED') { console.log('--- TEST 1 PASSED SUCCESSFULLY! ---'); } else { throw new Error('Status not updated.'); }
  } catch (err) { console.error('--- TEST 1 FAILED ---'); console.error(err); } finally { await pg.end(); }
}
runTest();
