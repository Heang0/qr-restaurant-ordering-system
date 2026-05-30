import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetSuperadminPassword(newPassword) {
  try {
    // Find superadmin user
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'superadmin');

    if (findError) throw findError;

    if (!users || users.length === 0) {
      console.log('No superadmin found. Let us create one.');
      const email = 'superadmin@example.com';
      const passwordHash = await bcrypt.hash(newPassword, 10);
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ email, password_hash: passwordHash, role: 'superadmin' }])
        .select()
        .single();
      if (createError) throw createError;
      console.log('Created superadmin:', email);
      return;
    }

    const superadmin = users[0];
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', superadmin.id);

    if (updateError) throw updateError;

    console.log(`Successfully reset password for superadmin: ${superadmin.email}`);
  } catch (err) {
    console.error('Error:', err);
  }
}

const args = process.argv.slice(2);
const newPassword = args[0] || 'admin123';
resetSuperadminPassword(newPassword);
