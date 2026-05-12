import { supabase } from './src/config/supabase.js';

async function getHeaders() {
  console.log('Fetching Categories headers...');
  const { data, error } = await supabase.from('categories').select('*').limit(0).csv();
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Categories CSV Header:', data);
  }

  console.log('Fetching Menu Items headers...');
  const { data: menuData, error: menuError } = await supabase.from('menu_items').select('*').limit(0).csv();
  
  if (menuError) {
    console.error('Error:', menuError.message);
  } else {
    console.log('Menu Items CSV Header:', menuData);
  }
}

getHeaders();
