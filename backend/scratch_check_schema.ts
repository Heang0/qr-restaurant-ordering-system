import { supabase } from './src/config/supabase.js';

async function introspectSchema() {
  console.log('Introspecting Categories table...');
  const { data: catCols, error: catErr } = await supabase.rpc('get_columns', { table_name: 'categories' });
  
  if (catErr) {
    // If RPC fails, try a direct query to information_schema via a raw SQL-like approach or just try fetching a single row
    console.log('RPC failed, trying alternative method...');
    const { data, error } = await supabase.from('categories').select().limit(0);
    if (error) {
      console.error('Error introspecting Categories:', error);
    } else {
      // Sometimes headers contain column info, but in JS SDK we can try to see what fields are returned
      console.log('Categories fields:', Object.keys(data?.[0] || {}));
    }
  } else {
    console.log('Categories columns:', catCols);
  }

  // Let's try to just fetch one item if exists
  const { data: sample } = await supabase.from('categories').select('*').limit(1);
  if (sample && sample.length > 0) {
     console.log('Sample Category:', sample[0]);
  } else {
     console.log('No rows in Categories, checking Menu Items...');
  }
}

introspectSchema();
