// Fill these from your Supabase project → Project Settings → API.
//   SUPABASE_URL       = "Project URL"
//   SUPABASE_ANON_KEY  = the "anon"/"public" key
//
// The anon key is SAFE to ship in the app — it's public, and Row Level Security
// in the database protects each user's data. The "service_role" key must NEVER
// live here; it goes only on the backend (Render env var).
export const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
export const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";

export const supabaseConfigured =
  !SUPABASE_URL.includes("YOUR-PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR-ANON");
