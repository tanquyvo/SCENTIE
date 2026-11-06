/* =========================================================
   SCENTIE — SHARED HEADER AUTH STATE
   Updates the account link across pages from Supabase session.
   ========================================================= */
(function () {
    "use strict";

    const ACCOUNT_LINK_SELECTOR = ".site-header .header-account";
    const DEFAULT_LABEL = "Đăng nhập / Đăng ký";
    const ACCOUNT_URL = () => {
        const path = window.location.pathname;
        return path.includes("/pages/") ? "account.html" : "pages/account.html";
    };

    function setLoggedOut(link) {
        link.classList.remove("is-authenticated");
        link.href = ACCOUNT_URL();
        link.setAttribute("aria-label", DEFAULT_LABEL);
        link.removeAttribute("title");

        const label = link.querySelector("span");
        if (label) label.textContent = DEFAULT_LABEL;
    }

    function setLoggedIn(link, name) {
        const displayName = (name || "").trim() || "Tài khoản";
        link.classList.add("is-authenticated");
        link.href = ACCOUNT_URL();
        link.setAttribute("aria-label", `Tài khoản của ${displayName}`);
        link.title = `Tài khoản của ${displayName}`;

        const label = link.querySelector("span");
        if (label) label.textContent = displayName;
    }

    async function updateAccountLink(client, session) {
        const links = document.querySelectorAll(ACCOUNT_LINK_SELECTOR);
        if (!links.length) return;

        const user = session && session.user;
        if (!user) {
            links.forEach(setLoggedOut);
            return;
        }

        let fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "";

        try {
            const { data, error } = await client
                .from("profiles")
                .select("full_name")
                .eq("id", user.id)
                .maybeSingle();

            if (!error && data?.full_name) {
                fullName = data.full_name;
            } else if (error) {
                console.warn("[SCENTIE] Could not load header profile name:", error.message);
            }
        } catch (error) {
            console.warn("[SCENTIE] Header profile lookup failed:", error);
        }

        if (!fullName) {
            fullName = user.email ? user.email.split("@")[0] : "Tài khoản";
        }

        links.forEach(link => setLoggedIn(link, fullName));
    }

    function init() {
        const links = document.querySelectorAll(ACCOUNT_LINK_SELECTOR);
        if (!links.length) return;

        const client = window.scentieSupabase;
        if (!client?.auth) {
            console.error("[SCENTIE] Shared Supabase client is unavailable. Check script order.");
            return;
        }

        // Show the signed-out state immediately, then hydrate from the saved session.
        links.forEach(setLoggedOut);

        client.auth.getSession().then(({ data, error }) => {
            if (error) {
                console.warn("[SCENTIE] Could not read auth session:", error.message);
                return;
            }
            updateAccountLink(client, data.session);
        });

        client.auth.onAuthStateChange((_event, session) => {
            // Defer profile queries until after the auth callback returns.
            Promise.resolve().then(() => updateAccountLink(client, session));
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
