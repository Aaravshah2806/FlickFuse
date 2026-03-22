export function generateUniqueId(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomLetter = () => letters[Math.floor(Math.random() * letters.length)];
  const randomNumber = () => Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${randomLetter()}${randomLetter()}${randomLetter()}-${randomNumber()}`;
}

export function checkSupabaseConfig(): boolean {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(supabaseUrl && supabaseKey && 
            supabaseUrl !== 'your_supabase_url' && 
            supabaseKey !== 'your_supabase_anon_key');
}
