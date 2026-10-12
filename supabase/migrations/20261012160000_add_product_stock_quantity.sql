-- Track inventory without guessing quantities for existing products.
-- Existing products remain NULL (not yet counted); new products default to zero.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_quantity integer;

ALTER TABLE public.products
  ALTER COLUMN stock_quantity SET DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.products'::regclass
      AND conname = 'products_stock_quantity_nonnegative'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_stock_quantity_nonnegative
      CHECK (stock_quantity IS NULL OR stock_quantity >= 0);
  END IF;
END $$;
