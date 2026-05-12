import { supabase } from './src/config/supabase.js';

async function discoveryMenu() {
  const { data: stores } = await supabase.from('stores').select('id').limit(1);
  if (!stores || stores.length === 0) return;
  const storeId = stores[0].id;

  console.log('Testing menu_items discovery...');
  const { data: item, error } = await supabase
    .from('menu_items')
    .insert([{ name: 'Discovery Item', price: 0, store_id: storeId }])
    .select('*')
    .single();

  if (error) {
    console.error('Menu discovery failed:', error.message);
  } else {
    console.log('Menu Columns found:', Object.keys(item));
    await supabase.from('menu_items').delete().eq('id', item.id);
  }
}

discoveryMenu();
