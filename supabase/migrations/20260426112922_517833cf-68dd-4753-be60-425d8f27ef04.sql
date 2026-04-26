
CREATE OR REPLACE FUNCTION public.charge_checker_fee(_count integer, _price_per_check numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _total numeric;
  _new_balance numeric;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _count IS NULL OR _count <= 0 THEN
    RAISE EXCEPTION 'Invalid count';
  END IF;
  IF _price_per_check IS NULL OR _price_per_check <= 0 THEN
    RAISE EXCEPTION 'Invalid price';
  END IF;

  _total := (_count::numeric) * _price_per_check;

  UPDATE public.profiles
     SET balance = balance - _total
   WHERE id = _user
     AND balance >= _total
  RETURNING balance INTO _new_balance;

  IF _new_balance IS NULL THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  RETURN _new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.charge_checker_fee(integer, numeric) FROM public;
GRANT EXECUTE ON FUNCTION public.charge_checker_fee(integer, numeric) TO authenticated;
