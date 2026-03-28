import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tfqxsykduoanlcxdeatr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcXhzeWtkdW9hbmxjeGRlYXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MjA3ODMsImV4cCI6MjA5MDE5Njc4M30.oJRwpeNttciKvj8dfcXVZGq2ZE2_L79LCxIlFX0s7Xg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
