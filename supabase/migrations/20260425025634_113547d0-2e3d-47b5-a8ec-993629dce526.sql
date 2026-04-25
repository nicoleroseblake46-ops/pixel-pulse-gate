-- Extend products with rich card metadata so cards section can show full info
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seller text,
  ADD COLUMN IF NOT EXISTS exp text,
  ADD COLUMN IF NOT EXISTS zip text,
  ADD COLUMN IF NOT EXISTS valid text,
  ADD COLUMN IF NOT EXISTS scheme text,
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS extras text;