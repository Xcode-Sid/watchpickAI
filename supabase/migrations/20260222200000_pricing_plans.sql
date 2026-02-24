-- Pricing plans (editable by admin)
CREATE TABLE public.pricing_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan TEXT NOT NULL UNIQUE CHECK (plan IN ('pro', 'lifetime')),
  locale TEXT NOT NULL DEFAULT 'en',
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  period TEXT NOT NULL,
  cta TEXT NOT NULL,
  badge TEXT,
  highlighted BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  stripe_price_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pricing plan features (editable by admin)
CREATE TABLE public.pricing_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.pricing_plans(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_pricing_features_plan ON public.pricing_features(plan_id);
CREATE INDEX idx_pricing_plans_plan_locale ON public.pricing_plans(plan, locale);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_features ENABLE ROW LEVEL SECURITY;

-- Public read for pricing (no auth required)
CREATE POLICY "Anyone can read pricing plans" ON public.pricing_plans FOR SELECT USING (true);
CREATE POLICY "Anyone can read pricing features" ON public.pricing_features FOR SELECT USING (true);

-- Only service role can write (admin API uses service role)
-- RLS allows SELECT for all; INSERT/UPDATE/DELETE require service role (bypasses RLS)

CREATE TRIGGER update_pricing_plans_updated_at
  BEFORE UPDATE ON public.pricing_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default pricing (en locale)
INSERT INTO public.pricing_plans (plan, locale, name, price, period, cta, badge, highlighted, sort_order) VALUES
  ('pro', 'en', 'Pro', '$4.99', '/month', 'Upgrade to Pro', 'Most Popular', true, 0),
  ('lifetime', 'en', 'Lifetime', '$19', 'one-time', 'Get Lifetime', NULL, false, 1);

INSERT INTO public.pricing_features (plan_id, text, sort_order)
SELECT id, f.text, f.ord
FROM public.pricing_plans p
CROSS JOIN (VALUES
  ('All 3 picks unlocked', 0),
  ('Hidden Gem bonus pick', 1),
  ('Save pick history', 2),
  ('Re-run quiz anytime', 3)
) AS f(text, ord)
WHERE p.plan = 'pro';

INSERT INTO public.pricing_features (plan_id, text, sort_order)
SELECT id, f.text, f.ord
FROM public.pricing_plans p
CROSS JOIN (VALUES
  ('Everything in Pro', 0),
  ('No monthly charge', 1),
  ('Lifetime access forever', 2)
) AS f(text, ord)
WHERE p.plan = 'lifetime';
