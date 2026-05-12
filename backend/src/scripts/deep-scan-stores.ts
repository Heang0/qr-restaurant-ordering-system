import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

async function deepScan() {
  console.log('--- DEEP SCAN START ---');
  
  // Try to insert an empty object to force an error that lists valid columns
  const { error } = await supabase
    .from('stores')
    .insert([{}]);

  if (error) {
    console.log('Database feedback:', error.message);
  }

  // Try to find the structure via a different method
  const { data, error: fetchError } = await supabase
    .from('stores')
    .select('*')
    .limit(1);

  if (fetchError) {
    console.error('Fetch Error:', fetchError);
  } else {
    console.log('Table exists. Rows found:', data.length);
    if (data.length > 0) {
      console.log('Columns found:', Object.keys(data[0]));
    }
  }
}

deepScan();
