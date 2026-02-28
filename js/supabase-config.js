const SUPABASE_URL = 'https://mnchytpajztpxtacankq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_h7H2X6sFhCM5rwz2brPqBg_qO42XiPE';

// Avoid initialization error if supabase is not defined (e.g. script failed to load)
const supabaseClient = typeof supabase !== 'undefined'
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

if (!supabaseClient) {
    console.warn("Supabase client is not loaded or configured.");
}
