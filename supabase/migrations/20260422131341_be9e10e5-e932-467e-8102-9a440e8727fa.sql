ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS balance numeric NOT NULL DEFAULT 0;

ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS bonus_amount numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_credit numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS cart_total numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS confirmed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

UPDATE public.payments
SET total_credit = amount + bonus_amount
WHERE total_credit = 0;

CREATE INDEX IF NOT EXISTS idx_payments_user_created_at ON public.payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_payments_updated_at ON public.payments;
CREATE TRIGGER set_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.prepare_pending_payment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.status := 'pending';
  NEW.confirmed_at := NULL;
  NEW.total_credit := NEW.amount + NEW.bonus_amount;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prepare_pending_payment ON public.payments;
CREATE TRIGGER prepare_pending_payment
BEFORE INSERT ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.prepare_pending_payment();

DROP POLICY IF EXISTS "Users update own payments" ON public.payments;
DROP POLICY IF EXISTS "Users create own payments" ON public.payments;
DROP POLICY IF EXISTS "Users view own payments" ON public.payments;

CREATE POLICY "Users create pending payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND amount >= 20
  AND bonus_amount >= 0
  AND cart_total >= 0
);

CREATE POLICY "Users view own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.confirm_payment(_payment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payment_record public.payments%ROWTYPE;
BEGIN
  SELECT * INTO payment_record
  FROM public.payments
  WHERE id = _payment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;

  IF payment_record.status = 'confirmed' THEN
    RETURN;
  END IF;

  IF payment_record.status <> 'pending' THEN
    RAISE EXCEPTION 'Payment is not pending';
  END IF;

  UPDATE public.payments
  SET status = 'confirmed', confirmed_at = now()
  WHERE id = _payment_id;

  UPDATE public.profiles
  SET balance = balance + payment_record.total_credit
  WHERE id = payment_record.user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_payment(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_payment(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.confirm_payment(uuid) FROM authenticated;