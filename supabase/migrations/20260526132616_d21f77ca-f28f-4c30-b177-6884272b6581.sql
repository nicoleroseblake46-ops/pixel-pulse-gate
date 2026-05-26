CREATE TABLE public.visitor_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT,
  user_agent TEXT,
  path TEXT,
  referrer TEXT,
  user_id UUID,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.visitor_logs TO authenticated;
GRANT ALL ON public.visitor_logs TO service_role;

ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view visitor logs"
ON public.visitor_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_visitor_logs_created_at ON public.visitor_logs (created_at DESC);
CREATE INDEX idx_visitor_logs_ip ON public.visitor_logs (ip_address);