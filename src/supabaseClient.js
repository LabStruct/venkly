import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rtllzorijfwihfrydncg.supabase.co';
const supabaseAnonKey = 'sb_publishable_LFKAeATxFCXRb3uG3bq2jQ_uqQETKeU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
