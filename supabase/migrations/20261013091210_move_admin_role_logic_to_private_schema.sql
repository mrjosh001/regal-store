-- Keep the exposed RPC as an invoker wrapper. Privileged role changes live
-- in the non-exposed private schema, with an explicit current-admin check.
CREATE OR REPLACE FUNCTION private.admin_set_profile_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
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

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Admins cannot change their own role';
  END IF;

  UPDATE public.profiles
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION private.admin_set_profile_role(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.admin_set_profile_role(uuid, text) FROM anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.admin_set_profile_role(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_profile_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO ''
AS $function$
BEGIN
  PERFORM private.admin_set_profile_role(target_user_id, new_role);
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_set_profile_role(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_profile_role(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_set_profile_role(uuid, text) TO authenticated;
