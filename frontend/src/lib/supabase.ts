import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials not configured. Auth features will be disabled.');
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
export const TMDB_API_URL = import.meta.env.VITE_TMDB_API_URL || 'https://api.themoviedb.org/3';

export function getImageUrl(path: string | null, size: 'w500' | 'original' = 'w500'): string {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export { supabase };
