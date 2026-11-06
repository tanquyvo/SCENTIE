# SCENTIE — Nocturne Admin Control Center

## Included
- Dark Liquid Glass Admin UI and responsive navigation.
- Dashboard metrics, 7-day revenue pulse, order status distribution.
- Orders list, filters, detail view, status/payment status updates.
- Product CRUD for the existing `products` schema (create, edit, activate/deactivate).
- Customer profiles and registered-customer order summaries.
- Admin directory, grant/revoke access by Auth User UID.
- Shared Supabase session guard and logout.

## 1. Apply migration
Open Supabase Studio → SQL Editor and run:
`supabase/migrations/20261106000200_scentie_admin_control_center.sql`

Run this in the same Supabase environment the local site is connected to. For local development, open `http://127.0.0.1:54323`.

## 2. Open Admin
Start the existing Live Server and open:
`http://127.0.0.1:3000/admin/login.html`

Sign in with an account whose UUID is already present in `private.admin_users`.

## Important schema notes
- The current `products` table has no stock quantity, description, or product gallery columns. The UI deliberately manages only existing columns: id, name, category, product_type, price, original_price, patches, image_path, is_active.
- Product image paths are stored as text. Use paths that match the storefront's existing asset conventions.
- Customer listing reads `profiles` and account-linked `orders`; guest orders have no user_id and therefore are not included in registered-customer aggregates.
- The current checkout is COD-only and shipping fee is server-controlled by the existing create-order Edge Function. The Admin UI does not alter those checkout rules.
- Admin creation still begins in Supabase Authentication → Users. Copy the new Auth User UID, then use Access & Team to grant access. Revocation is performed through a security-definer RPC and cannot remove the current user or last remaining Admin.
- No service-role key is placed in frontend code.

## Existing storefront protection
Only `admin/` and the separate `css/admin.css`, `js/admin-*.js` files are modified. The storefront homepage, shop, product detail, cart, checkout, header and footer are not edited.
