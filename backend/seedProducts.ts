import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Fetching stores...');
  const { data: stores, error: storeError } = await supabase.from('stores').select('id, name, bakong_account_id');
  
  if (storeError) {
    console.error('Error fetching stores:', storeError);
    return;
  }

  if (!stores || stores.length === 0) {
    console.log('No stores found to seed.');
    return;
  }

  for (const store of stores) {
    console.log(`Seeding products for store: ${store.name} (ID: ${store.id})`);

    // Create Category
    console.log('Creating category...');
    const { data: category, error: catError } = await supabase
      .from('categories')
      .insert([
        { store_id: store.id, name: 'Popular Dishes', name_km: 'មុខម្ហូបពេញនិយម', is_active: true }
      ])
      .select()
      .single();

    if (catError) {
      console.error('Error creating category:', catError);
      continue;
    }

    // Create Products
    console.log('Creating products...');
    const products = [
      {
        store_id: store.id,
        category_id: category.id,
        name: 'Beef Lok Lak',
        name_km: 'ឡុកឡាក់សាច់គោ',
        description: 'Traditional Cambodian stir-fried beef with pepper sauce',
        price: 0.15,
        image: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=800&q=80',
        is_available: true
      },
      {
        store_id: store.id,
        category_id: category.id,
        name: 'Fish Amok',
        name_km: 'អាម៉ុកត្រី',
        description: 'Classic Cambodian steamed fish curry',
        price: 0.15,
        image: 'https://images.unsplash.com/photo-1548943487-a2e4d43b4850?auto=format&fit=crop&w=800&q=80',
        is_available: true
      },
      {
        store_id: store.id,
        category_id: category.id,
        name: 'Iced Coffee',
        name_km: 'កាហ្វេទឹកកក',
        description: 'Strong local coffee with sweetened condensed milk',
        price: 0.05,
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
        is_available: true
      }
    ];

    const { error: prodError } = await supabase.from('menu_items').insert(products);

    if (prodError) {
      console.error('Error creating products:', prodError);
      continue;
    }
  }

  console.log('✅ Seed completed successfully! Test products added to your store.');
}

seed();
