import { createClient } from '@supabase/supabase-js';
import { envConfig } from '../utils/env';

// Supabase configuration using validated environment variables
export const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'owner' | 'employee';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'owner' | 'employee';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'owner' | 'employee';
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          marketplace_id: string | null;
          sku: string;
          title: string;
          price: number;
          stock: number;
          image_url: string | null;
          status: 'active' | 'draft' | 'archived';
          created_at: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          product_id: string | null;
          type: 'review' | 'question';
          author_name: string;
          rating: number | null;
          text: string;
          response: string | null;
          is_read: boolean;
          created_at: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          user_id: string;
          marketplace_id: string | null;
          name: string;
          budget: number;
          spent: number;
          ctr: number;
          status: 'active' | 'paused' | 'completed';
          created_at: string;
        };
      };
      sales: {
        Row: {
          id: string;
          user_id: string;
          product_id: string | null;
          amount: number;
          quantity: number;
          date: string;
          created_at: string;
        };
      };
    };
  };
};
