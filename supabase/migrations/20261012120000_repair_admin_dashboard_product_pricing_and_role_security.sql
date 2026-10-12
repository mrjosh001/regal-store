-- Repair product pricing schema and restrict catalog mutations to administrators.
-- Also prevent users from self-promoting through profile updates; role changes go through
-- an RPC that checks the caller's existing admin role.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS compare_at_price integer;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_compare_at_price_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_compare_at_price_check
  CHECK (compare_at_price IS NULL OR compare_at_price >= price);

DROP POLICY IF EXISTS "Allow authenticated insert" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.products;

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'
  ));

REVOKE UPDATE ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT UPDATE (full_name, email, phone, avatar_url, updated_at)
  ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_profile_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can change account roles';
  END IF;

  IF new_role NOT IN ('admin', 'customer') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  UPDATE public.profiles
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_profile_role(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_profile_role(uuid, text) TO authenticated;
