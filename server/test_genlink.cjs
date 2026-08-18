const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '../.env'});
const supabase = createClient(process.env.VITE_SUPABASE_URL, 'sb_secret_bP_rFr2ib6ExLwuHOjNXQQ_7gkra4D8');
async function run() {
  const res = await supabase.auth.admin.generateLink({
    type: 'signup',
    email: 'abhitomar2538@gmail.com',
    password: 'Password123!',
    data: { role: 'Restaurant' }
  });
  console.log(res);
}
run();
