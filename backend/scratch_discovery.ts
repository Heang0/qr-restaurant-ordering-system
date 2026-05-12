import { supabase } from './src/config/supabase.js';

async function findColumns() {
  // 1. Get a real store ID
  const { data: stores } = await supabase.from('stores').select('id').limit(1);
  if (!stores || stores.length === 0) {
    console.error('No stores found to test with.');
    return;
  }
  const storeId = stores[0].id;
  console.log('Using storeId:', storeId);

  // 2. Insert minimal category
  const { data: cat, error: insertErr } = await supabase
    .from('categories')
    .insert([{ name: 'Discovery Cat', store_id: storeId }])
    .select('*')
    .single();

  if (insertErr) {
    console.error('Insert failed:', insertErr.message);
  } else {
    console.log('SUCCESS! Columns found:', Object.keys(cat));
    // 3. Cleanup
    await supabase.from('categories').delete().eq('id', cat.id);
  }
}

findColumns();
