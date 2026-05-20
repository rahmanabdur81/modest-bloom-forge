CREATE OR REPLACE FUNCTION public.link_guest_orders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_email text;
  v_count integer := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT lower(email) INTO v_email FROM auth.users WHERE id = v_user_id;

  IF v_email IS NULL THEN
    RETURN 0;
  END IF;

  UPDATE public.orders
  SET user_id = v_user_id
  WHERE user_id IS NULL
    AND lower(customer_email) = v_email;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_guest_orders() TO authenticated;