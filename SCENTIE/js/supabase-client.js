/* ========================================
   SCENTIE — SUPABASE CLIENT
   Plain HTML / CSS / JavaScript setup
   ======================================== */

(function () {
    "use strict";

    // Supabase project configuration.
    // The publishable key is intended for browser use; database access
    // must still be protected by the project's Row Level Security policies.
    // Detect local development or production environment
    const isLocal = ["localhost", "127.0.0.1"].includes(
        window.location.hostname
    );

    // Supabase URLs
    const SUPABASE_URL = isLocal
        ? "http://127.0.0.1:54321"
        : "https://lfytlgrwzevogmmlstpl.supabase.co";

    // Publishable keys
    const SUPABASE_PUBLISHABLE_KEY = isLocal
        ? "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
        : "sb_publishable_SoHVTGEE4mP7CA4lsEV82w_ocNywPGu";

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
        console.error(
            "[SCENTIE] Supabase JS library was not loaded. " +
            "Load @supabase/supabase-js before js/supabase-client.js."
        );
        return;
    }

    if (window.scentieSupabase) {
        return;
    }

    window.scentieSupabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    );

    console.info("[SCENTIE] Supabase client initialized.");
})();
