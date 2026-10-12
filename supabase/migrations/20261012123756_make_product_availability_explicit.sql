ALTER TABLE public.products
  ALTER COLUMN is_available DROP NOT NULL,
  ALTER COLUMN is_available DROP DEFAULT;
ALTER TABLE public.products
  ALTER COLUMN is_available SET DEFAULT NULL;

-- Existing products received the column's initial default before availability was reviewed.
-- Reset that unverified default so the storefront does not claim items are in stock without confirmation.
UPDATE public.products
SET is_available = NULL
WHERE is_available IS TRUE;
