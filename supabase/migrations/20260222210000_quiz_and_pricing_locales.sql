-- 1. Update pricing_plans: allow (plan, locale) unique for multi-locale support
ALTER TABLE public.pricing_plans DROP CONSTRAINT IF EXISTS pricing_plans_plan_key;
ALTER TABLE public.pricing_plans ADD CONSTRAINT pricing_plans_plan_locale_unique UNIQUE (plan, locale);

-- 2. Seed pricing for additional locales (it, de, sq, ru)
INSERT INTO public.pricing_plans (plan, locale, name, price, period, cta, badge, highlighted, sort_order)
SELECT * FROM (VALUES
  ('pro', 'it', 'Pro', '4,99 €', '/mese', 'Passa a Pro', 'Più popolare', true, 0),
  ('lifetime', 'it', 'Lifetime', '19 €', 'una tantum', 'Ottieni Lifetime', NULL, false, 1),
  ('pro', 'de', 'Pro', '4,99 €', '/Monat', 'Upgrade auf Pro', 'Beliebteste', true, 0),
  ('lifetime', 'de', 'Lifetime', '19 €', 'einmalig', 'Lifetime holen', NULL, false, 1),
  ('pro', 'sq', 'Pro', '4,99 $', '/muaj', 'Përmirëso në Pro', 'Më e popullarizuara', true, 0),
  ('lifetime', 'sq', 'Lifetime', '19 $', 'një herë', 'Merr Lifetime', NULL, false, 1),
  ('pro', 'ru', 'Pro', '499 ₽', '/мес', 'Перейти на Pro', 'Популярный', true, 0),
  ('lifetime', 'ru', 'Lifetime', '1900 ₽', 'разово', 'Получить Lifetime', NULL, false, 1)
) AS v(plan, locale, name, price, period, cta, badge, highlighted, sort_order)
ON CONFLICT (plan, locale) DO NOTHING;

-- Add features for new locales
INSERT INTO public.pricing_features (plan_id, text, sort_order)
SELECT p.id, f.text, f.ord
FROM public.pricing_plans p
CROSS JOIN (VALUES
  ('Tutte e 3 le raccomandazioni sbloccate', 0),
  ('Hidden Gem bonus', 1),
  ('Cronologia salvataggi', 2),
  ('Ripeti quiz quando vuoi', 3)
) AS f(text, ord)
WHERE p.plan = 'pro' AND p.locale = 'it'
AND NOT EXISTS (SELECT 1 FROM public.pricing_features pf WHERE pf.plan_id = p.id);

INSERT INTO public.pricing_features (plan_id, text, sort_order)
SELECT p.id, f.text, f.ord
FROM public.pricing_plans p
CROSS JOIN (VALUES
  ('Tutto di Pro', 0),
  ('Nessun canone mensile', 1),
  ('Accesso a vita', 2)
) AS f(text, ord)
WHERE p.plan = 'lifetime' AND p.locale = 'it';

INSERT INTO public.pricing_features (plan_id, text, sort_order)
SELECT p.id, f.text, f.ord
FROM public.pricing_plans p
CROSS JOIN (VALUES
  ('Alle 3 Empfehlungen freigeschaltet', 0),
  ('Hidden Gem Bonus', 1),
  ('Verlauf speichern', 2),
  ('Quiz jederzeit wiederholen', 3)
) AS f(text, ord)
WHERE p.plan = 'pro' AND p.locale = 'de';

INSERT INTO public.pricing_features (plan_id, text, sort_order)
SELECT p.id, f.text, f.ord
FROM public.pricing_plans p
CROSS JOIN (VALUES
  ('Alles in Pro', 0),
  ('Keine monatliche Gebühr', 1),
  ('Lebenslanger Zugang', 2)
) AS f(text, ord)
WHERE p.plan = 'lifetime' AND p.locale = 'de';

INSERT INTO public.pricing_features (plan_id, text, sort_order)
SELECT p.id, f.text, f.ord
FROM public.pricing_plans p
CROSS JOIN (VALUES
  ('Të gjitha 3 rekomandimet të zhbllokuara', 0),
  ('Hidden Gem bonus', 1),
  ('Ruaj historikun', 2),
  ('Përsërit kuizin kur të duash', 3)
) AS f(text, ord)
WHERE p.plan = 'pro' AND p.locale = 'sq';

INSERT INTO public.pricing_features (plan_id, text, sort_order)
SELECT p.id, f.text, f.ord
FROM public.pricing_plans p
CROSS JOIN (VALUES
  ('Gjithçka në Pro', 0),
  ('Pa tarifë mujore', 1),
  ('Akses përjetë', 2)
) AS f(text, ord)
WHERE p.plan = 'lifetime' AND p.locale = 'sq';

INSERT INTO public.pricing_features (plan_id, text, sort_order)
SELECT p.id, f.text, f.ord
FROM public.pricing_plans p
CROSS JOIN (VALUES
  ('Все 3 рекомендации разблокированы', 0),
  ('Бонус Hidden Gem', 1),
  ('Сохранить историю', 2),
  ('Повторить квиз в любое время', 3)
) AS f(text, ord)
WHERE p.plan = 'pro' AND p.locale = 'ru';

INSERT INTO public.pricing_features (plan_id, text, sort_order)
SELECT p.id, f.text, f.ord
FROM public.pricing_plans p
CROSS JOIN (VALUES
  ('Всё из Pro', 0),
  ('Без ежемесячной платы', 1),
  ('Пожизненный доступ', 2)
) AS f(text, ord)
WHERE p.plan = 'lifetime' AND p.locale = 'ru';

-- 3. Quiz steps and options tables
CREATE TABLE public.quiz_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('slider', 'radio')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.quiz_step_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_id UUID NOT NULL REFERENCES public.quiz_steps(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  label TEXT NOT NULL,
  min_label TEXT,
  max_label TEXT,
  UNIQUE(step_id, locale)
);

CREATE TABLE public.quiz_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_id UUID NOT NULL REFERENCES public.quiz_steps(id) ON DELETE CASCADE,
  api_value TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.quiz_option_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  option_id UUID NOT NULL REFERENCES public.quiz_options(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  text TEXT NOT NULL,
  UNIQUE(option_id, locale)
);

CREATE INDEX idx_quiz_step_content_step ON public.quiz_step_content(step_id);
CREATE INDEX idx_quiz_options_step ON public.quiz_options(step_id);
CREATE INDEX idx_quiz_option_content_option ON public.quiz_option_content(option_id);

ALTER TABLE public.quiz_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_step_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_option_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read quiz_steps" ON public.quiz_steps FOR SELECT USING (true);
CREATE POLICY "Anyone can read quiz_step_content" ON public.quiz_step_content FOR SELECT USING (true);
CREATE POLICY "Anyone can read quiz_options" ON public.quiz_options FOR SELECT USING (true);
CREATE POLICY "Anyone can read quiz_option_content" ON public.quiz_option_content FOR SELECT USING (true);

-- Seed quiz steps (en)
INSERT INTO public.quiz_steps (key, type, sort_order) VALUES
  ('budget', 'slider', 0),
  ('occasion', 'radio', 1),
  ('style', 'radio', 2),
  ('movementType', 'radio', 3),
  ('wristSize', 'radio', 4),
  ('gender', 'radio', 5),
  ('brandOpenness', 'radio', 6);

-- Seed quiz step content (en)
INSERT INTO public.quiz_step_content (step_id, locale, label, min_label, max_label)
SELECT s.id, 'en', 
  CASE s.key 
    WHEN 'budget' THEN 'What''s your budget?'
    WHEN 'occasion' THEN 'What''s the occasion?'
    WHEN 'style' THEN 'What style do you prefer?'
    WHEN 'movementType' THEN 'Movement type preference?'
    WHEN 'wristSize' THEN 'What''s your wrist size?'
    WHEN 'gender' THEN 'Gender preference?'
    WHEN 'brandOpenness' THEN 'Brand preference?'
  END,
  CASE WHEN s.key = 'budget' THEN '$50' ELSE NULL END,
  CASE WHEN s.key = 'budget' THEN '$10,000+' ELSE NULL END
FROM public.quiz_steps s;

-- Seed budget options
INSERT INTO public.quiz_options (step_id, api_value, sort_order)
SELECT s.id, v.api_val, v.ord
FROM public.quiz_steps s
CROSS JOIN (VALUES
  ('Under $200', 0),
  ('$200–$500', 1),
  ('$500–$2,000', 2),
  ('$2,000–$5,000', 3),
  ('$5,000+', 4)
) AS v(api_val, ord)
WHERE s.key = 'budget';

INSERT INTO public.quiz_option_content (option_id, locale, text)
SELECT o.id, 'en', v.txt
FROM public.quiz_options o
JOIN public.quiz_steps s ON o.step_id = s.id
CROSS JOIN (VALUES
  (0, 'Under $200'),
  (1, '$200–$500'),
  (2, '$500–$2,000'),
  (3, '$2,000–$5,000'),
  (4, '$5,000+')
) AS v(ord, txt)
WHERE s.key = 'budget' AND o.sort_order = v.ord;

-- Seed radio options for other steps
INSERT INTO public.quiz_options (step_id, api_value, sort_order)
SELECT s.id, v.api_val, v.ord
FROM public.quiz_steps s
CROSS JOIN (VALUES
  ('occasion', 'Daily Wear', 0),
  ('occasion', 'Business', 1),
  ('occasion', 'Sport & Outdoor', 2),
  ('occasion', 'Formal Events', 3),
  ('occasion', 'Gift for Someone', 4),
  ('style', 'Classic & Timeless', 0),
  ('style', 'Modern & Minimal', 1),
  ('style', 'Bold & Statement', 2),
  ('style', 'Luxury & Prestigious', 3),
  ('movementType', 'Automatic', 0),
  ('movementType', 'Manual Wind', 1),
  ('movementType', 'Quartz', 2),
  ('movementType', 'No preference', 3),
  ('wristSize', 'Small (under 6.5")', 0),
  ('wristSize', 'Medium (6.5"–7.5")', 1),
  ('wristSize', 'Large (over 7.5")', 2),
  ('gender', 'Men''s', 0),
  ('gender', 'Women''s', 1),
  ('gender', 'Unisex', 2),
  ('brandOpenness', 'Any brand', 0),
  ('brandOpenness', 'Luxury only (Rolex, Omega, etc.)', 1),
  ('brandOpenness', 'Mid-range (Tissot, Seiko, etc.)', 2),
  ('brandOpenness', 'Budget friendly', 3),
  ('brandOpenness', 'No smartwatches please', 4)
) AS v(step_key, api_val, ord)
WHERE s.key = v.step_key;

INSERT INTO public.quiz_option_content (option_id, locale, text)
SELECT o.id, 'en', o.api_value
FROM public.quiz_options o
JOIN public.quiz_steps s ON o.step_id = s.id
WHERE s.key != 'budget';
