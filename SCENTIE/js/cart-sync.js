/* SCENTIE — account cart synchronization (guest cart remains LocalStorage) */
(function () {
  "use strict";
  const KEY = "SCENTIE_CART_V1";
  const client = window.scentieSupabase;
  if (!client) return;
  let syncing = false;

  function readLocal() {
    try { const value = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(value) ? value : []; }
    catch (_) { return []; }
  }
  function writeLocal(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("scentie:cart-updated", { detail: { cart: items, source: "sync" } }));
  }
  function normalize(items) {
    const map = new Map();
    (Array.isArray(items) ? items : []).forEach(item => {
      if (!item || typeof item.id !== "string" || !item.id) return;
      const quantity = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)));
      if (map.has(item.id)) map.get(item.id).quantity = Math.min(99, map.get(item.id).quantity + quantity);
      else map.set(item.id, { ...item, quantity });
    });
    return [...map.values()];
  }
  async function syncForUser(user) {
    if (syncing || !user?.id) return;
    syncing = true;
    try {
      const local = normalize(readLocal());
      const { data, error } = await client.from("user_carts").select("items").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      const cloud = normalize(data?.items || []);
      const mergedMap = new Map(cloud.map(item => [item.id, item]));
      local.forEach(item => {
        if (mergedMap.has(item.id)) mergedMap.get(item.id).quantity = Math.max(mergedMap.get(item.id).quantity, item.quantity);
        else mergedMap.set(item.id, item);
      });
      const merged = [...mergedMap.values()];
      const { error: saveError } = await client.from("user_carts").upsert({ user_id: user.id, items: merged, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (saveError) throw saveError;
      writeLocal(merged);
      console.info("[SCENTIE] Cart synchronized for signed-in user.");
    } catch (error) {
      console.error("[SCENTIE] Cart sync failed:", error);
      window.dispatchEvent(new CustomEvent("scentie:cart-sync-error", { detail: { message: error.message } }));
    } finally { syncing = false; }
  }
  async function saveForCurrentUser() {
    if (syncing) return;
    const { data } = await client.auth.getUser();
    if (!data?.user) return;
    try {
      const { error } = await client.from("user_carts").upsert({ user_id: data.user.id, items: normalize(readLocal()), updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw error;
    } catch (error) { console.error("[SCENTIE] Could not save cart:", error); }
  }
  client.auth.getSession().then(({ data }) => { if (data?.session?.user) syncForUser(data.session.user); });
  client.auth.onAuthStateChange((event, session) => {
    if (session?.user && ["SIGNED_IN", "INITIAL_SESSION", "TOKEN_REFRESHED"].includes(event)) setTimeout(() => syncForUser(session.user), 0);
  });
  window.addEventListener("scentie:cart-updated", saveForCurrentUser);
  window.addEventListener("storage", event => { if (event.key === KEY) saveForCurrentUser(); });
  window.SCENTIE_CART_SYNC = { syncForUser, saveForCurrentUser };
})();
