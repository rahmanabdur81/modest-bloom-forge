
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_reason text;

-- Allow users to update their own orders, restricted to cancellation of pending/processing orders
DROP POLICY IF EXISTS "Users can cancel own orders" ON public.orders;
CREATE POLICY "Users can cancel own orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND lower(status) IN ('pending', 'processing')
)
WITH CHECK (
  auth.uid() = user_id
  AND lower(status) = 'cancelled'
);
