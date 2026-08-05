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
    user_id, coin, amount, bonus_amount, cart_total, wallet_address,
    status, confirmed_at, total_credit, metadata
  ) VALUES (
    current_user_id, 'BALANCE', 0, 0, _cart_total, 'BALANCE_PURCHASE',
    'confirmed', now(), 0,
    jsonb_build_object('cart_items', _items, 'payment_method', 'balance')
  )
  RETURNING id INTO order_id;

  -- Purchased cards are one-of-a-kind: remove them from inventory.
  DELETE FROM public.products p
  USING jsonb_array_elements(_items) AS it
  WHERE (it->>'id') LIKE 'cards-%'
    AND p.category = 'cards'
    AND p.id::text = substring(it->>'id' from 7);

  RETURN order_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_refund_dead_card(_payment_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rec public.payments%ROWTYPE;
  new_balance numeric;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO rec FROM public.payments WHERE id = _payment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF rec.user_id <> auth.uid() THEN RAISE EXCEPTION 'Not your order'; END IF;
  IF COALESCE(rec.refund_status, '') = 'approved' THEN
    RETURN (SELECT balance FROM public.profiles WHERE id = auth.uid());
  END IF;
  IF rec.created_at < now() - interval '5 minutes' THEN
    RAISE EXCEPTION 'Refund window expired';
  END IF;
  IF COALESCE(rec.cart_total, 0) <= 0 THEN RAISE EXCEPTION 'Nothing to refund'; END IF;

  UPDATE public.payments
     SET refund_status = 'approved',
         refund_reason = 'Auto-refund: card checked dead within grace period',
         refund_requested_at = now()
   WHERE id = _payment_id;

  UPDATE public.profiles
     SET balance = balance + rec.cart_total
   WHERE id = auth.uid()
  RETURNING balance INTO new_balance;

  RETURN new_balance;
END;
$function$;

REVOKE ALL ON FUNCTION public.auto_refund_dead_card(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.auto_refund_dead_card(uuid) TO authenticated;