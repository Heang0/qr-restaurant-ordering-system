import { supabase } from './src/config/supabase.js';

async function testDescInsert() {
  const testCat = {
    name: 'Test Category',
    desc: 'Test Description',
    store_id: '816e8731-f155-4309-8d19-4874c72807f6'
  };

  console.log('Testing desc insert...');
  const { data, error } = await supabase.from('categories').insert([testCat]).select();
  
  if (error) {
    console.error('Desc insert failed:', error.message);
  } else {
    console.log('Desc insert success!', data);
    await supabase.from('categories').delete().eq('id', data[0].id);
  }
}

testDescInsert();
