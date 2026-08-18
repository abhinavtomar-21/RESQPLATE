import { supabaseAdmin } from '../src/lib/supabaseAdmin.js';
import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];
  
  if (!email || !password) {
    console.error("Usage: tsx create_admin.ts <email> <password>");
    process.exit(1);
  }

  console.log(`Creating Admin User: ${email}...`);
  
  const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: {
      role: 'Administrator',
      name: 'Platform Administrator',
      status: 'APPROVED'
    }
  });
  
  if (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }
  
  console.log("Admin auth user created:", user.user.id);
  
  // Update the profile manually to ensure role maps correctly (trigger handles it, but just in case)
  const { error: profileError } = await supabaseAdmin.from('profiles').update({
    role: 'Administrator',
    permission_group: 'Super Admin',
    approval_status: 'APPROVED',
    profile_completed: true
  }).eq('id', user.user.id);
  
  if (profileError) {
    console.error("Failed to update admin profile:", profileError.message);
    process.exit(1);
  }
  
  console.log(`✅ Administrator account successfully created and verified!`);
}

createAdmin();
