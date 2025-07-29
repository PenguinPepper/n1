import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;
const supabase: SupabaseClient = createClient(supabaseUrl,
  supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: true,
    }
  }
);

export default supabase;
