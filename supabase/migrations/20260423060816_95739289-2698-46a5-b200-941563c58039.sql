CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  admin_reply TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users create own tickets"
ON public.tickets
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND length(trim(subject)) BETWEEN 2 AND 120
  AND length(trim(message)) BETWEEN 2 AND 2000
  AND status = 'open'
  AND admin_reply IS NULL
  AND resolved_at IS NULL
);

CREATE POLICY "Users view own tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins view all tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update tickets"
ON public.tickets
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  AND status IN ('open', 'answered', 'closed')
);

CREATE POLICY "Admins remove tickets"
ON public.tickets
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_tickets_user_created ON public.tickets (user_id, created_at DESC);
CREATE INDEX idx_tickets_status_created ON public.tickets (status, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;