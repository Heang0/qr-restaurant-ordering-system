import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

async function testInsert() {
  console.log('Testing store insertion with proper DB fields...');
  
  const testStore = {
    name: 'Test Store ' + Date.now(),
    slug: 'test-store-' + Date.now(),
    description: 'A test store description',
    is_active: true
  };

  const { data, error } = await supabase
    .from('stores')
    .insert([testStore])
    .select();

  if (error) {
    console.error('--- INSERTION FAILED ---');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Details:', error.details);
    console.error('Hint:', error.hint);
  } else {
    console.log('--- INSERTION SUCCESS ---');
    console.log('Data:', data);
    
    // Clean up
    await supabase.from('stores').delete().eq('id', data[0].id);
    console.log('Test store cleaned up.');
  }
}

testInsert();
