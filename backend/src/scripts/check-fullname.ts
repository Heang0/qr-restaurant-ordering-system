import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkFullName() {
  console.log('Checking for full_name column...');
  
  const { error } = await supabase
    .from('users')
    .select('full_name')
    .limit(1);

  if (error) {
    if (error.code === 'PGRST204' || error.message.includes('column "full_name" does not exist')) {
      console.log('--- ACTION NEEDED ---');
      console.log('The "full_name" column is missing. Please run this SQL in Supabase:');
      console.log('ALTER TABLE users ADD COLUMN full_name TEXT;');
    } else {
      console.error('Error:', error);
    }
  } else {
    console.log('--- SUCCESS ---');
    console.log('The "full_name" column exists and is ready!');
  }
}

checkFullName();
