import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkSchema() {
  console.log('Checking users table schema...');
  
  // Try to fetch one user to see available columns
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching schema:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Available columns:', Object.keys(data[0]));
  } else {
    console.log('No users found to check columns.');
  }
}

checkSchema();
