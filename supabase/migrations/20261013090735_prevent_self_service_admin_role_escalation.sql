-- Prevent self-service profile inserts from choosing privileged roles.
-- The auth.users trigger creates profiles server-side, so direct client INSERT is unnecessary.
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
REVOKE INSERT ON TABLE public.profiles FROM authenticated;
REVOKE INSERT ON TABLE public.profiles FROM anon;

-- Keep the role-changing RPC callable only by signed-in users; its function body
-- independently verifies that the caller is an existing admin.
REVOKE ALL ON FUNCTION public.admin_set_profile_role(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_profile_role(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_set_profile_role(uuid, text) TO authenticated;
