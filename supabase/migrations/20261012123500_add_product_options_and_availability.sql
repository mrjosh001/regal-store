-- Add lightweight product options and an admin-controlled availability flag.
-- Arrays keep the catalogue simple; ordering remains confirmed via WhatsApp rather than recorded as a database transaction.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sizes text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS colors text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS is_available boolean NOT NULL DEFAULT true;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_sizes_no_blank_values,
  DROP CONSTRAINT IF EXISTS products_colors_no_blank_values;

ALTER TABLE public.products
  ADD CONSTRAINT products_sizes_no_blank_values
    CHECK (array_position(sizes, '') IS NULL),
  ADD CONSTRAINT products_colors_no_blank_values
    CHECK (array_position(colors, '') IS NULL);
