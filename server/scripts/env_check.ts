import dotenv from 'dotenv';

dotenv.config({ path: 'server/.env' });

const REQUIRED_ENV_VARS = [
  'PORT',
  'FRONTEND_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL'
];

function checkEnv() {
  console.log('🔍 Checking Environment Variables...');
  
  let missing = false;
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      console.error(`❌ CRITICAL: Missing required environment variable: ${envVar}`);
      missing = true;
    }
  }

  if (missing) {
    console.error('🛑 Environment check failed. Server cannot start securely. Exiting...');
    process.exit(1);
  }

  console.log('✅ Environment check passed! All secrets loaded securely.');
}

checkEnv();
