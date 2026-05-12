import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkStoresSchema() {
  console.log('Checking stores table schema...');
  
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching schema:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Available columns:', Object.keys(data[0]));
  } else {
    console.log('No stores found. Let\'s try to get column names from an empty select.');
    const { data: cols, error: colError } = await supabase.rpc('get_column_names', { table_name: 'stores' });
    if (colError) console.error('Could not get columns:', colError);
    else console.log('Columns:', cols);
  }
}

checkStoresSchema();
