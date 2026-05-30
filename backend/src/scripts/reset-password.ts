import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

async function resetPassword() {
  const email = 'hakchhaiheang0@gmail.com'; // Change this if your superadmin email is different
  const newPassword = 'password123'; // The new password you want to set

  console.log(`Searching for user: ${email}...`);

  // Find user
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', email)
    .single();

  if (error || !user) {
    console.error('User not found. Ensure the user exists in your database.');
    return;
  }

  console.log('--- User Found ---');
  console.log('ID:', user.id);
  console.log('Email:', user.email);
  console.log('Role:', user.role);

  // Hash new password
  console.log('Hashing new password...');
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update password in DB
  const { error: updateError } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('id', user.id);

  if (updateError) {
    console.error('Failed to update password:', updateError);
  } else {
    console.log(`✅ Success! Password for ${email} has been reset to: ${newPassword}`);
  }
}

resetPassword();
