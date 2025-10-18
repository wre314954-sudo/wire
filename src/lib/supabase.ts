import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : ({} as any);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          brand: string;
          category: string;
          colors: string[];
          description: string;
          specifications: any;
          base_price: number;
          unit_type: string;
          stock_quantity: number;
          image_url: string;
          brochure_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand: string;
          category: string;
          colors?: string[];
          description: string;
          specifications?: any;
          base_price: number;
          unit_type: string;
          stock_quantity?: number;
          image_url: string;
          brochure_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          brand?: string;
          category?: string;
          colors?: string[];
          description?: string;
          specifications?: any;
          base_price?: number;
          unit_type?: string;
          stock_quantity?: number;
          image_url?: string;
          brochure_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          order_number: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          customer_address: string;
          customer_pincode: string;
          items: any;
          subtotal: number;
          shipping_cost: number;
          total_amount: number;
          status: string;
          payment_status: string;
          payment_method: string;
          qr_code_data: string | null;
          transaction_id: string | null;
          estimated_delivery: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          order_number: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          customer_address: string;
          customer_pincode: string;
          items: any;
          subtotal: number;
          shipping_cost?: number;
          total_amount: number;
          status?: string;
          payment_status?: string;
          payment_method: string;
          qr_code_data?: string | null;
          transaction_id?: string | null;
          estimated_delivery?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          order_number?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          customer_address?: string;
          customer_pincode?: string;
          items?: any;
          subtotal?: number;
          shipping_cost?: number;
          total_amount?: number;
          status?: string;
          payment_status?: string;
          payment_method?: string;
          qr_code_data?: string | null;
          transaction_id?: string | null;
          estimated_delivery?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inquiries: {
        Row: {
          id: string;
          user_type: string;
          full_name: string;
          phone: string;
          email: string;
          address: string;
          pincode: string;
          product_name: string;
          brand: string;
          color: string;
          quantity: number;
          unit: string;
          specifications: any | null;
          verification_code: string | null;
          is_verified: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_type: string;
          full_name: string;
          phone: string;
          email: string;
          address: string;
          pincode: string;
          product_name: string;
          brand: string;
          color: string;
          quantity: number;
          unit: string;
          specifications?: any | null;
          verification_code?: string | null;
          is_verified?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_type?: string;
          full_name?: string;
          phone?: string;
          email?: string;
          address?: string;
          pincode?: string;
          product_name?: string;
          brand?: string;
          color?: string;
          quantity?: number;
          unit?: string;
          specifications?: any | null;
          verification_code?: string | null;
          is_verified?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      owner_credentials: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      carts: {
        Row: {
          id: string;
          user_id: string;
          items: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          items: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          items?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
