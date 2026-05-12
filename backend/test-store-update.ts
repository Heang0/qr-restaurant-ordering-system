import { supabase } from './src/config/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

async function testUpdate() {
  const storeId = '30000000-0000-0000-0000-000000000001'; // Try to find an existing store ID or use a known one
  
  console.log('Testing store update...');
  
  const { data: store, error } = await supabase
    .from('stores')
    .update({ 
      name: 'Updated Test Store Name',
      description: 'Updated Description'
    })
    .eq('id', storeId)
    .select();
    
  if (error) {
    console.error('Update failed:', error);
  } else {
    console.log('Update successful:', store);
  }
}

testUpdate();
