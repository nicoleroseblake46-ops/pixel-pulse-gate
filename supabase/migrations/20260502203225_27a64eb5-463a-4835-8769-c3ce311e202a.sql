DROP POLICY IF EXISTS "Users create pending supported deposits" ON public.payments;

CREATE POLICY "Users create pending supported deposits"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id)
  AND (status = 'pending'::text)
  AND (amount >= (100)::numeric)
  AND (bonus_amount >= (0)::numeric)
  AND (cart_total >= (0)::numeric)
  AND (coin = ANY (ARRAY['BTC'::text, 'LTC'::text, 'USDT/TRC20'::text]))
);