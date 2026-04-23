DROP POLICY IF EXISTS "Users create pending payments" ON public.payments;

CREATE POLICY "Users create pending supported deposits"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND amount >= 50
  AND bonus_amount >= 0
  AND cart_total >= 0
  AND coin = ANY (ARRAY['BTC'::text, 'LTC'::text, 'USDT/TRC20'::text])
);

CREATE OR REPLACE FUNCTION public.purchase_cart(_items jsonb, _cart_total numeric)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
  current_balance numeric;
  order_id uuid;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF _cart_total IS NULL OR _cart_total <= 0 THEN
    RAISE EXCEPTION 'Cart total must be greater than zero';
  END IF;

  IF _items IS NULL OR jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  SELECT balance INTO current_balance
  FROM public.profiles
  WHERE id = current_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF current_balance < _cart_total THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  UPDATE public.profiles
  SET balance = balance - _cart_total
  WHERE id = current_user_id;

  INSERT INTO public.payments (
    user_id,
    coin,
    amount,
    bonus_amount,
    cart_total,
    wallet_address,
    status,
    confirmed_at,
    total_credit,
    metadata
  ) VALUES (
    current_user_id,
    'BALANCE',
    0,
    0,
    _cart_total,
    'BALANCE_PURCHASE',
    'confirmed',
    now(),
    0,
    jsonb_build_object('cart_items', _items, 'payment_method', 'balance')
  )
  RETURNING id INTO order_id;

  RETURN order_id;
END;
$function$;