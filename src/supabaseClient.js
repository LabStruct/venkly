import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabase.com/dashboard/project/rtllzorijfwihfrydncg';
const supabaseAnonKey = 'sb_publishable_LFKAeATxFCXRb3uG3bq2jQ_uqQETKeU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);