
-- VENDORS
CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text NOT NULL UNIQUE,
  name text NOT NULL,
  bio text,
  avatar_url text,
  rating numeric NOT NULL DEFAULT 5.0,
  sales_count integer NOT NULL DEFAULT 0,
  sales_total numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.vendors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vendors TO authenticated;
GRANT ALL ON public.vendors TO service_role;

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active vendors"
  ON public.vendors FOR SELECT
  USING (is_active OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage vendors"
  ON public.vendors FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PRODUCT VENDOR LINK
ALTER TABLE public.products ADD COLUMN vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL;
CREATE INDEX products_vendor_id_idx ON public.products(vendor_id);

-- APP SETTINGS
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON public.app_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can write settings"
  ON public.app_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.app_settings (key, value) VALUES ('sales_hidden', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- SEED VENDORS
INSERT INTO public.vendors (handle, name, bio, rating, sort_order) VALUES
  ('ghostbyte',  'GhostByte',  'Veteran base supplier · fresh first-hand drops daily.', 4.9, 1),
  ('neoncrew',   'NeonCrew',   'High-valid US & EU cards · responsive support.',         4.8, 2),
  ('cryowave',   'CryoWave',   'Premium logs and balance-rich bases.',                   4.7, 3)
ON CONFLICT (handle) DO NOTHING;

-- Rotate existing card products across the 3 vendors so the storefront has data immediately.
WITH v AS (
  SELECT id, row_number() OVER (ORDER BY sort_order) - 1 AS rn
  FROM public.vendors
),
p AS (
  SELECT id, row_number() OVER (ORDER BY created_at) - 1 AS rn
  FROM public.products
  WHERE category = 'cards' AND vendor_id IS NULL
)
UPDATE public.products pr
SET vendor_id = v.id
FROM p, v
WHERE pr.id = p.id AND v.rn = (p.rn % (SELECT count(*) FROM v));

-- REFUND FUNCTION (used by CC Checker for dead cards)
CREATE OR REPLACE FUNCTION public.refund_checker_fee(_count integer, _price_per_check numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user uuid := auth.uid();
  _total numeric;
  _new_balance numeric;
BEGIN
  IF _user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _count IS NULL OR _count <= 0 THEN RETURN (SELECT balance FROM public.profiles WHERE id = _user); END IF;
  IF _price_per_check IS NULL OR _price_per_check <= 0 THEN RAISE EXCEPTION 'Invalid price'; END IF;

  _total := (_count::numeric) * _price_per_check;

  UPDATE public.profiles
     SET balance = balance + _total
   WHERE id = _user
  RETURNING balance INTO _new_balance;

  RETURN _new_balance;
END;
$$;
