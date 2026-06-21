import { createClient } from '@supabase/supabase-js';

// 1. Sua URL real
const supabaseUrl = "https://vrxagdnvhkmnfqhlbfkv.supabase.co";

// 2. Sua Anon Key real (coloque a sua chave bem longa completa dentro das aspas)
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeGFnZG52aGttbmZxaGxiZmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNTY2OTYsImV4cCI6MjA5NzYzMjY5Nn0.GSwmKcaAyi1MMHShopQXj3h8PEYXJa3b1CPjW2ekmSc";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam as variáveis de ambiente do Supabase!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);