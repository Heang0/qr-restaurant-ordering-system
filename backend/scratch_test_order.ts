import { supabase } from './src/config/supabase.js';

async function testOrderInsert() {
  const testCat = {
    name: 'Test Category Order',
    order: 1,
    store_id: '816e8731-f155-4309-8d19-4874c72807f6'
  };

  console.log('Testing order insert...');
  const { data, error } = await supabase.from('categories').insert([testCat]).select();
  
  if (error) {
    console.error('Order insert failed:', error.message);
  } else {
    console.log('Order insert success!', data);
    await supabase.from('categories').delete().eq('id', data[0].id);
  }
}

testOrderInsert();
