
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS full_card text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS host_ip text;

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS refund_status text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS refund_reason text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS refund_requested_at timestamptz;

CREATE OR REPLACE FUNCTION public.request_refund(_payment_id uuid, _reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  payment_record public.payments%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO payment_record FROM public.payments WHERE id = _payment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF payment_record.user_id <> auth.uid() THEN RAISE EXCEPTION 'Not your order'; END IF;
  IF COALESCE(payment_record.refund_status, '') = 'requested' THEN RETURN; END IF;
  UPDATE public.payments
     SET refund_status = 'requested',
         refund_reason = _reason,
         refund_requested_at = now()
   WHERE id = _payment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_refund(_payment_id uuid, _approve boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  payment_record public.payments%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  SELECT * INTO payment_record FROM public.payments WHERE id = _payment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment not found'; END IF;
  IF COALESCE(payment_record.refund_status, '') <> 'requested' THEN RAISE EXCEPTION 'No refund pending'; END IF;
  IF _approve THEN
    UPDATE public.payments SET refund_status = 'approved' WHERE id = _payment_id;
    IF payment_record.cart_total > 0 THEN
      UPDATE public.profiles SET balance = balance + payment_record.cart_total WHERE id = payment_record.user_id;
    END IF;
  ELSE
    UPDATE public.payments SET refund_status = 'denied' WHERE id = _payment_id;
  END IF;
END;
$$;
