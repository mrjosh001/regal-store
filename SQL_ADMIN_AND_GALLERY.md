# Run this in Supabase SQL Editor

Copy the contents of:

`supabase/migrations/20261013120000_user_moderation_and_product_gallery.sql`

into the Supabase **SQL Editor** and run it once.

This adds:
- `products.image_urls` (multiple image URLs)
- `profiles.banned_at` / `profiles.deleted_at`
- RPCs: `admin_set_user_banned`, `admin_soft_delete_user`, `delete_own_account`
