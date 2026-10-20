-- Product gallery/color-aware ordering and customer order-request history.
-- Images remain externally hosted URLs; this stores URLs only, never image files.

CREATE TABLE IF NOT EXISTS public.order_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending_whatsapp',
  channel text NOT NULL DEFAULT 'whatsapp',
  total numeric(12,2) NOT NULL DEFAULT 0,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_requests_status_check CHECK (status IN ('pending_whatsapp', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  CONSTRAINT order_requests_channel_check CHECK (channel IN ('whatsapp'))
);

CREATE INDEX IF NOT EXISTS order_requests_user_created_idx
  ON public.order_requests(user_id, created_at DESC);

ALTER TABLE public.order_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own order requests" ON public.order_requests;
CREATE POLICY "Users can view their own order requests"
  ON public.order_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own order requests" ON public.order_requests;
CREATE POLICY "Users can create their own order requests"
  ON public.order_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT ON public.order_requests TO authenticated;
REVOKE ALL ON public.order_requests FROM anon;
