import { supabase } from '../config/supabase.js';

export const LIMITS = {
  free: {
    tables: 10,
    categories: 10,
    products: 30
  },
  pro: {
    tables: 30,
    categories: 30,
    products: 100
  },
  pro_max: {
    tables: Infinity,
    categories: Infinity,
    products: Infinity
  }
};

export type ResourceType = 'tables' | 'categories' | 'products';

export const checkPlanLimit = async (storeId: string, resourceType: ResourceType) => {
  // Get store plan
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('plan')
    .eq('id', storeId)
    .single();

  if (storeError || !store) {
    throw new Error('Store not found or database error');
  }

  const currentPlan = (store.plan || 'free') as keyof typeof LIMITS;
  const limit = LIMITS[currentPlan][resourceType];

  if (limit === Infinity) {
    return true; // No limit
  }

  // Check current usage based on resource type
  let count = 0;
  let countError = null;

  if (resourceType === 'tables') {
    const { count: tableCount, error } = await supabase
      .from('tables')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId);
    count = tableCount || 0;
    countError = error;
  } else if (resourceType === 'categories') {
    const { count: catCount, error } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId);
    count = catCount || 0;
    countError = error;
  } else if (resourceType === 'products') {
    const { count: prodCount, error } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId);
    count = prodCount || 0;
    countError = error;
  }

  if (countError) {
    throw new Error('Database error counting resources');
  }

  if (count >= limit) {
    const error: any = new Error(`PLAN_LIMIT_REACHED`);
    error.code = 'PLAN_LIMIT_REACHED';
    error.details = { resourceType, limit, count, plan: currentPlan };
    throw error;
  }

  return true;
};
