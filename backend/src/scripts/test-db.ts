import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  const { data: items, error: itemError } = await supabase.from('menu_items').select('*').limit(1);
  
  if (itemError) {
    console.error('Menu items check failed:', itemError.message);
  } else {
    console.log('Menu items table accessible! Columns:', Object.keys(items[0] || {}));
    console.log('Sample data:', items[0]);
  }
}

testConnection();
