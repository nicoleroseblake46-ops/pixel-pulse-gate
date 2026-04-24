-- Product category enum
DO $$ BEGIN
  CREATE TYPE public.product_category AS ENUM ('sales','cards','proxy','tools','socks','rdp');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category public.product_category NOT NULL,
  name text NOT NULL,
  meta text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  tag text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  -- card specific
  bin text,
  country text,
  state text,
  brand text,
  card_type text,
  bank text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated view active products" ON public.products;
CREATE POLICY "Authenticated view active products"
ON public.products FOR SELECT TO authenticated
USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins insert products" ON public.products;
CREATE POLICY "Admins insert products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins update products" ON public.products;
CREATE POLICY "Admins update products"
ON public.products FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins delete products" ON public.products;
CREATE POLICY "Admins delete products"
ON public.products FOR DELETE TO authenticated
USING (public.has_role(auth.uid(),'admin'));

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER TABLE public.products REPLICA IDENTITY FULL;
