-- Multi-image gallery + user moderation (ban / soft-delete)

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';

-- Backfill gallery from primary image
UPDATE public.products
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL
  AND image_url <> ''
  AND (image_urls IS NULL OR cardinality(image_urls) = 0);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS banned_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE OR REPLACE FUNCTION public.is_profile_active(target_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = target_id
      AND p.banned_at IS NULL
      AND p.deleted_at IS NULL
  );
$$;

-- Admin: ban / unban
CREATE OR REPLACE FUNCTION public.admin_set_user_banned(
  target_user_id uuid,
  should_ban boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Only admins can ban users';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot ban your own account';
  END IF;

  UPDATE public.profiles
  SET
    banned_at = CASE WHEN should_ban THEN now() ELSE NULL END,
    updated_at = now()
  WHERE id = target_user_id;
END;
$$;

-- Admin: soft-delete a user profile
CREATE OR REPLACE FUNCTION public.admin_soft_delete_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot delete your own admin account from here';
  END IF;

  UPDATE public.profiles
  SET
    deleted_at = now(),
    banned_at = coalesce(banned_at, now()),
    full_name = 'Deleted user',
    email = NULL,
    avatar_url = NULL,
    role = 'customer',
    updated_at = now()
  WHERE id = target_user_id;
END;
$$;

-- Customer: delete own account (soft)
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.profiles
  SET
    deleted_at = now(),
    banned_at = coalesce(banned_at, now()),
    full_name = 'Deleted user',
    email = NULL,
    avatar_url = NULL,
    role = 'customer',
    updated_at = now()
  WHERE id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_user_banned(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_soft_delete_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_profile_active(uuid) TO authenticated;
