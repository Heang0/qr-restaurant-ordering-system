import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

async function resetAdmin() {
  const email = 'hakchhaiheang0@gmail.com';
  console.log(`Searching for user: ${email}...`);

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', email)
    .single();

  if (error || !user) {
    console.error('User not found.');
    return;
  }

  console.log('--- User Found ---');
  console.log('ID:', user.id);
  console.log('Email:', user.email);
  console.log('Role:', user.role);

  if (user.role !== 'superadmin') {
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'superadmin' })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update role:', updateError);
    } else {
      console.log('✅ Success! Role restored to \'superadmin\'');
    }
  } else {
    console.log('User is already superadmin.');
  }
}

resetAdmin();
