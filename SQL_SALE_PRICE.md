# Add sale / original price support

Run this once in Supabase → SQL Editor:

```sql
ALTER TABLE products
ADD COLUMN IF NOT EXISTS compare_at_price INTEGER;

COMMENT ON COLUMN products.compare_at_price IS 'Original price before discount. Leave null if not on sale.';
```

After running:
- In Admin, set **Original Price** higher than **Price** to show a sale badge
- Example: Original 15000, Price 10000 → shows "-33% OFF"
