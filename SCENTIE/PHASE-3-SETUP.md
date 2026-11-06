# SCENTIE — Phase 3 setup

This update adds guest checkout, account cart synchronization, order creation, and signed-in order history. Existing homepage, shop, product detail, header, footer, and LocalStorage cart behavior are retained.

## 1. Run the database migration

In Supabase Dashboard → SQL Editor, run the complete file:

`supabase/migrations/20261106000100_scentie_guest_checkout_and_cart_sync.sql`

It makes `orders.user_id` nullable for guest purchases and creates the RLS-protected `user_carts` table. It does not recreate or reset existing tables or customer data.

## 2. Deploy the order Edge Function

Install/use the Supabase CLI and link the existing project, then from the `SCENTIE` project folder run:

```bash
supabase link --project-ref lfytlgrwzevogmmlstpl
supabase functions deploy create-order
```

The function uses the Supabase-managed `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables. Do not put the service-role key in any frontend file or share it in chat. `verify_jwt = false` is intentional because guest checkout has no user session; the function validates an optional signed-in user's access token itself.

## 3. Test in this order

1. Open the site with an empty browser cart and add one product.
2. Open `pages/cart.html` and confirm quantity/subtotal render as before.
3. Continue to checkout and submit a COD order while signed out. Confirm the order appears in Supabase `orders` with `user_id = NULL` and its rows appear in `order_items`.
4. Sign in, add a product, then open the site on another tab/browser with the same account. Confirm the cart is synchronized.
5. Place an order while signed in. Confirm `orders.user_id` is the signed-in user's UUID and the order appears in the account page history.

## Current scope / deliberate limitations

- Guest orders can be created, but guest order history is not exposed through an account.
- Signed-in order history shows the latest 10 orders.
- COD is enabled in checkout. VNPay is reserved for Phase 4; the backend currently records the selected payment method but does not create a VNPay payment URL.
- Shipping fee is currently zero and shown as pending confirmation. Configure shipping rules before production launch.
- The Edge Function reads trusted product prices from `public.products`; keep that catalogue synchronized with the website catalogue.
