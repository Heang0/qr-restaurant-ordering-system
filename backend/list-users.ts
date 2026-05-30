import { supabase } from './src/config/supabase.js';

async function listUsers() {
  const { data, error } = await supabase.from('users').select('id, email, role');
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Users:', data);
  }
}

listUsers();
