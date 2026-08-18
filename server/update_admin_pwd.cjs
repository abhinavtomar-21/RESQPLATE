const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data, error } = await supabase.auth.admin.updateUserById('00000000-0000-0000-0000-000000000001', { password: 'password123' });
    if (error) console.error(error);
    else console.log('Password updated to password123');
}
run().catch(console.error);
