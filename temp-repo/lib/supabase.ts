import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bbhfcoxoogsskukaccib.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaGZjb3hvb2dzc2t1a2FjY2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NjExNDQsImV4cCI6MjA5MDIzNzE0NH0.Z8NBypcW_M6e_5Af5170_lDtPd54QzL5qJLhy2srrbA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
