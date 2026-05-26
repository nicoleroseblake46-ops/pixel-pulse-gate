REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.approve_payment(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.reject_payment(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.confirm_payment(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.assign_admin_role_by_email(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.charge_checker_fee(integer, numeric) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.purchase_cart(jsonb, numeric) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_payment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_payment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_admin_role_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.charge_checker_fee(integer, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_cart(jsonb, numeric) TO authenticated;