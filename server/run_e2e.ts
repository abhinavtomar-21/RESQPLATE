import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Use service role for admin tasks during test

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runE2E() {
  console.log("Starting End-to-End Database Verification...");
  const results: any[] = [];
  
  const addResult = (step: string, status: string, details: string) => {
    results.push({ step, status, details });
    console.log(`[${status}] ${step} - ${details}`);
  };

  try {
    // 1. Check Profiles Table constraints
    const testEmail = `test_${Date.now()}@resqplate.com`;
    const { data: user, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'password123',
      email_confirm: true,
      user_metadata: { role: 'Restaurant' }
    });

    if (authError) {
      addResult("Create Test User", "FAIL", authError.message);
      throw authError;
    }
    addResult("Create Test User", "PASS", `User created with ID: ${user.user.id}`);

    // Allow time for trigger to run
    await new Promise(r => setTimeout(r, 2000));

    // 2. Verify Profile Trigger
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();

    if (profileError || !profile) {
      addResult("Profile Trigger", "FAIL", profileError?.message || "Profile not found");
    } else {
      addResult("Profile Trigger", "PASS", `Profile automatically created with role ${profile.role} and status ${profile.approval_status}`);
    }

    // 3. Test Constraints (Invalid Role)
    const { error: constraintError } = await supabase
      .from('profiles')
      .update({ role: 'INVALID_ROLE' })
      .eq('id', user.user.id);
      
    if (constraintError) {
      addResult("Role Constraint", "PASS", `Correctly rejected invalid role: ${constraintError.message}`);
    } else {
      addResult("Role Constraint", "FAIL", "Allowed invalid role update");
    }

    // 4. Verification Request Workflow
    const { data: vr, error: vrError } = await supabase
      .from('verification_requests')
      .insert({
        restaurant_id: user.user.id,
        restaurant_name: 'Test Restaurant',
        status: 'PENDING',
        documents: { url: 'test.pdf' }
      })
      .select()
      .single();

    if (vrError) {
      addResult("Create Verification Request", "FAIL", vrError.message);
    } else {
      addResult("Create Verification Request", "PASS", `Verification request created with ID: ${vr.id}`);
    }

    // 5. Admin Approval Simulation
    const { error: approveError } = await supabase
      .from('profiles')
      .update({ approval_status: 'APPROVED' })
      .eq('id', user.user.id);

    if (approveError) {
      addResult("Admin Approval", "FAIL", approveError.message);
    } else {
      addResult("Admin Approval", "PASS", "Profile successfully updated to APPROVED");
    }

    // Cleanup
    await supabase.auth.admin.deleteUser(user.user.id);
    addResult("Cleanup", "PASS", "Test user deleted");

    // Write results to artifact
    const markdown = `# End-to-End Verification Results\n\n| Step | Status | Details |\n|---|---|---|\n` + 
      results.map(r => `| ${r.step} | ${r.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} | ${r.details} |`).join('\n');
      
    fs.writeFileSync('e2e_results.md', markdown);
    console.log("Results written to e2e_results.md");

  } catch (e: any) {
    console.error("E2E Test Failed:", e);
  }
}

runE2E();
