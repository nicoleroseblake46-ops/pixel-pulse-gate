
CREATE OR REPLACE FUNCTION public.admin_adjust_balance(_user_id uuid, _amount numeric, _note text DEFAULT NULL)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_balance numeric;
  _payment_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF _user_id IS NULL THEN RAISE EXCEPTION 'User required'; END IF;
  IF _amount IS NULL OR _amount = 0 THEN RAISE EXCEPTION 'Amount must be non-zero'; END IF;

  UPDATE public.profiles
     SET balance = balance + _amount
   WHERE id = _user_id
  RETURNING balance INTO _new_balance;

  IF _new_balance IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;

  INSERT INTO public.payments (
    user_id, coin, amount, bonus_amount, cart_total, wallet_address,
    status, confirmed_at, total_credit, metadata
  ) VALUES (
    _user_id, 'ADMIN_ADJUST', GREATEST(_amount, 0), 0, 0, 'ADMIN_ADJUST',
    'confirmed', now(), _amount,
    jsonb_build_object('admin_id', auth.uid(), 'note', _note, 'delta', _amount)
  ) RETURNING id INTO _payment_id;

  RETURN _new_balance;
END;
$$;
