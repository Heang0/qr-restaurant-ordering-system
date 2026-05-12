import { supabase } from './src/config/supabase.js';

async function testMinimalInsert() {
  const testCat = {
    name: 'Test Category',
    store_id: '816e8731-f155-4309-8d19-4874c72807f6' // A known store ID from previous logs
  };

  console.log('Testing minimal insert...');
  const { data, error } = await supabase.from('categories').insert([testCat]).select();
  
  if (error) {
    console.error('Minimal insert failed:', error.message);
  } else {
    console.log('Minimal insert success!', data);
    // Cleanup
    await supabase.from('categories').delete().eq('id', data[0].id);
  }
}

testMinimalInsert();
