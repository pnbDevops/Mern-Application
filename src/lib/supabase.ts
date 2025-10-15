import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'expense' | 'income';
  color: string;
  icon: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  date: string;
  type: 'expense' | 'income';
  created_at: string;
  categories?: Category;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: string;
  created_at: string;
  categories?: Category;
}
