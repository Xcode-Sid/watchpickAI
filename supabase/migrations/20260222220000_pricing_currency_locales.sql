-- Pricing & Quiz: currency conversion per locale
-- Base: USD. Rates: EUR 0.90, ALL 82 ($4.9≈401 L), RUB 90
-- en: USD, it/de: EUR, sq: ALL (Lek), ru: RUB

-- 1. Update pricing_plans for sq (Albania) - use ALL. $4.99≈409 L, $19≈1560 L
UPDATE public.pricing_plans SET price = '409 L' WHERE plan = 'pro' AND locale = 'sq';
UPDATE public.pricing_plans SET price = '1 560 L' WHERE plan = 'lifetime' AND locale = 'sq';

-- 2. Update pricing_plans for it/de (EUR) - $4.99≈4.49€, $19≈17€
UPDATE public.pricing_plans SET price = '4,49 €' WHERE plan = 'pro' AND locale IN ('it', 'de');
UPDATE public.pricing_plans SET price = '17 €' WHERE plan = 'lifetime' AND locale IN ('it', 'de');

-- 3. Update pricing_plans for ru (Russia) - use RUB. $4.99≈450₽, $19≈1710₽
UPDATE public.pricing_plans SET price = '449 ₽' WHERE plan = 'pro' AND locale = 'ru';
UPDATE public.pricing_plans SET price = '1 710 ₽' WHERE plan = 'lifetime' AND locale = 'ru';

-- 4. Add quiz_step_content for budget (min/max labels) for it, de, sq, ru
INSERT INTO public.quiz_step_content (step_id, locale, label, min_label, max_label)
SELECT s.id, v.loc, v.lbl, v.min_lbl, v.max_lbl
FROM public.quiz_steps s
CROSS JOIN (VALUES
  ('it', 'Qual è il tuo budget?', '45 €', '9.000 €+'),
  ('de', 'Was ist dein Budget?', '45 €', '9.000 €+'),
  ('sq', 'Cili është buxheti juaj?', '4 100 L', '820 000 L+'),
  ('ru', 'Какой у вас бюджет?', '4 500 ₽', '900 000 ₽+')
) AS v(loc, lbl, min_lbl, max_lbl)
WHERE s.key = 'budget'
ON CONFLICT (step_id, locale) DO UPDATE SET label = EXCLUDED.label, min_label = EXCLUDED.min_label, max_label = EXCLUDED.max_label;

-- 5. Add quiz_option_content for budget options (it, de, sq, ru)
-- api_value stays USD for backend; text is localized display
-- Map: sort_order 0-4 → Under $200, $200–$500, $500–$2,000, $2,000–$5,000, $5,000+
INSERT INTO public.quiz_option_content (option_id, locale, text)
SELECT o.id, v.loc, v.txt
FROM public.quiz_options o
JOIN public.quiz_steps s ON o.step_id = s.id
CROSS JOIN (VALUES
  ('it', 0, 'Sotto 180 €'),
  ('it', 1, '180–450 €'),
  ('it', 2, '450–1.800 €'),
  ('it', 3, '1.800–4.500 €'),
  ('it', 4, '4.500 €+'),
  ('de', 0, 'Unter 180 €'),
  ('de', 1, '180–450 €'),
  ('de', 2, '450–1.800 €'),
  ('de', 3, '1.800–4.500 €'),
  ('de', 4, '4.500 €+'),
  ('sq', 0, 'Nën 16 400 L'),
  ('sq', 1, '16 400–41 000 L'),
  ('sq', 2, '41 000–164 000 L'),
  ('sq', 3, '164 000–410 000 L'),
  ('sq', 4, '410 000 L+'),
  ('ru', 0, 'До 18 000 ₽'),
  ('ru', 1, '18 000–45 000 ₽'),
  ('ru', 2, '45 000–180 000 ₽'),
  ('ru', 3, '180 000–450 000 ₽'),
  ('ru', 4, '450 000 ₽+')
) AS v(loc, ord, txt)
WHERE s.key = 'budget' AND o.sort_order = v.ord
ON CONFLICT (option_id, locale) DO UPDATE SET text = EXCLUDED.text;
