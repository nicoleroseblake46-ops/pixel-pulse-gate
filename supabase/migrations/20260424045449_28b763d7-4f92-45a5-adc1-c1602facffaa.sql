-- Normalize legacy data to match new check
UPDATE public.payments SET coin = 'BTC' WHERE coin NOT IN ('BTC','LTC','USDT/TRC20','BALANCE');
UPDATE public.payments SET status = 'rejected' WHERE status = 'failed';

-- Fix coin check to match actual app values + allow internal BALANCE purchases
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_coin_check;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_coin_check
  CHECK (coin = ANY (ARRAY['BTC'::text, 'LTC'::text, 'USDT/TRC20'::text, 'BALANCE'::text]));

-- Fix status check to align with admin flow (rejected, not failed)
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_status_check
  CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'rejected'::text]));

-- Fix trigger so balance purchases stay confirmed immediately
CREATE OR REPLACE FUNCTION public.prepare_pending_payment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Internal balance checkouts are pre-confirmed by purchase_cart - leave them alone
  IF NEW.coin = 'BALANCE' THEN
    NEW.total_credit := COALESCE(NEW.total_credit, 0);
    RETURN NEW;
  END IF;

  -- Crypto top-ups always start pending and credit equals amount + bonus
  NEW.status := 'pending';
  NEW.confirmed_at := NULL;
  NEW.total_credit := NEW.amount + NEW.bonus_amount;
  RETURN NEW;
END;
$function$;