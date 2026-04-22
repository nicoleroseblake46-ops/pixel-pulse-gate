CREATE OR REPLACE FUNCTION public.assign_admin_role_by_email(_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_profile public.profiles%ROWTYPE;
  normalized_email text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  normalized_email := lower(trim(_email));

  IF normalized_email IS NULL OR normalized_email = '' OR normalized_email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$' THEN
    RAISE EXCEPTION 'Enter a valid email address';
  END IF;

  SELECT p.* INTO target_profile
  FROM public.profiles p
  WHERE lower(coalesce(p.username, '')) = split_part(normalized_email, '@', 1)
  ORDER BY p.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No account profile found for this email';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_profile.id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN jsonb_build_object(
    'user_id', target_profile.id,
    'username', target_profile.username,
    'role', 'admin'
  );
END;
$$;