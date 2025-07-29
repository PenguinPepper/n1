import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase: SupabaseClient = createClient(supabaseUrl,
  supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: true,
    }
  }
);

export default supabase;
