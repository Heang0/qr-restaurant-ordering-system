import { supabase } from './src/config/supabase.js';

async function testEnInsert() {
  const testCat = {
    name_en: 'Test Category',
    description_en: 'Test Description',
    store_id: '816e8731-f155-4309-8d19-4874c72807f6'
  };

  console.log('Testing en insert...');
  const { data, error } = await supabase.from('categories').insert([testCat]).select();
  
  if (error) {
    console.error('En insert failed:', error.message);
  } else {
    console.log('En insert success!', data);
    await supabase.from('categories').delete().eq('id', data[0].id);
  }
}

testEnInsert();
