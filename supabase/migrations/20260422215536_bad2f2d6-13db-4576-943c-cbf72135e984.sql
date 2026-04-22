-- Ensure updates has editable timestamp support
ALTER TABLE public.updates
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Add automatic updated_at maintenance
DROP TRIGGER IF EXISTS set_updates_updated_at ON public.updates;
CREATE TRIGGER set_updates_updated_at
BEFORE UPDATE ON public.updates
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Allow admins to manage news/update entries from the backend
DROP POLICY IF EXISTS "Admins create updates" ON public.updates;
CREATE POLICY "Admins create updates"
ON public.updates
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins edit updates" ON public.updates;
CREATE POLICY "Admins edit updates"
ON public.updates
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins remove updates" ON public.updates;
CREATE POLICY "Admins remove updates"
ON public.updates
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Seed reference news if the table is empty
INSERT INTO public.updates (title, description, category, created_at)
SELECT * FROM (VALUES
  ('The latest basic information has been updated by 80,000+ people.', 'The latest basic information has been updated by 80,000+ people.', 'news', TIMESTAMPTZ '2026-04-22 02:51:43+00'),
  ('130,000+ views updated, please enjoy.', '130,000+ views updated, please enjoy.', 'news', TIMESTAMPTZ '2026-04-11 06:43:37+00'),
  ('100,000+ fresh secondhand cards have been updated.', '100,000+ fresh secondhand cards have been updated.', 'cards', TIMESTAMPTZ '2026-04-04 13:19:56+00'),
  ('12000-SV''s First-hand Fish CC E-commerce Fish. Please contact customer service if interested.', '12000-SV''s First-hand Fish CC E-commerce Fish. Please contact customer service if interested.', 'cards', TIMESTAMPTZ '2026-03-26 12:43:19+00'),
  ('The latest basic version has been updated with over 100,000 views.', 'The latest basic version has been updated with over 100,000 views.', 'news', TIMESTAMPTZ '2026-03-23 11:39:51+00'),
  ('Big data has been updated; purchases are welcome.', 'Big data has been updated; purchases are welcome.', 'sales', TIMESTAMPTZ '2026-03-16 05:25:24+00')
) AS seed(title, description, category, created_at)
WHERE NOT EXISTS (SELECT 1 FROM public.updates);