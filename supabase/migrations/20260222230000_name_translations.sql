-- nameTranslations: Add JSON columns to existing tables. Keep current structure.
-- Logic: COALESCE(col->>locale, col->>'en', existing_col). Admin can add locales to the JSON.
-- Uses JSON type (not JSONB).

-- 1. pricing_plans: add *_translations columns
ALTER TABLE public.pricing_plans ADD COLUMN IF NOT EXISTS name_translations JSON DEFAULT '{}';
ALTER TABLE public.pricing_plans ADD COLUMN IF NOT EXISTS price_translations JSON DEFAULT '{}';
ALTER TABLE public.pricing_plans ADD COLUMN IF NOT EXISTS period_translations JSON DEFAULT '{}';
ALTER TABLE public.pricing_plans ADD COLUMN IF NOT EXISTS cta_translations JSON DEFAULT '{}';
ALTER TABLE public.pricing_plans ADD COLUMN IF NOT EXISTS badge_translations JSON DEFAULT '{}';

-- Populate: merge all locales per plan into each row (so any row can serve any locale)
UPDATE public.pricing_plans p1 SET
  name_translations = COALESCE((SELECT json_object_agg(p2.locale, p2.name) FROM public.pricing_plans p2 WHERE p2.plan = p1.plan), '{}'::json),
  price_translations = COALESCE((SELECT json_object_agg(p2.locale, p2.price) FROM public.pricing_plans p2 WHERE p2.plan = p1.plan), '{}'::json),
  period_translations = COALESCE((SELECT json_object_agg(p2.locale, p2.period) FROM public.pricing_plans p2 WHERE p2.plan = p1.plan), '{}'::json),
  cta_translations = COALESCE((SELECT json_object_agg(p2.locale, p2.cta) FROM public.pricing_plans p2 WHERE p2.plan = p1.plan), '{}'::json),
  badge_translations = COALESCE((SELECT json_object_agg(p2.locale, p2.badge) FROM public.pricing_plans p2 WHERE p2.plan = p1.plan AND p2.badge IS NOT NULL), '{}'::json);

-- 2. pricing_features: add text_translations
ALTER TABLE public.pricing_features ADD COLUMN IF NOT EXISTS text_translations JSON DEFAULT '{}';

-- Populate: merge all locales per (plan, sort_order). Features with same sort_order across plan locales = same feature.
UPDATE public.pricing_features pf SET text_translations = (
  SELECT COALESCE(json_object_agg(p.locale, pf2.text), '{}'::json)
  FROM public.pricing_features pf2
  JOIN public.pricing_plans p ON pf2.plan_id = p.id
  WHERE p.plan = (SELECT plan FROM public.pricing_plans WHERE id = pf.plan_id)
  AND pf2.sort_order = pf.sort_order
);

-- 3. quiz_step_content: add *_translations columns
ALTER TABLE public.quiz_step_content ADD COLUMN IF NOT EXISTS label_translations JSON DEFAULT '{}';
ALTER TABLE public.quiz_step_content ADD COLUMN IF NOT EXISTS min_label_translations JSON DEFAULT '{}';
ALTER TABLE public.quiz_step_content ADD COLUMN IF NOT EXISTS max_label_translations JSON DEFAULT '{}';

-- Populate: merge all locales per step
UPDATE public.quiz_step_content q1 SET
  label_translations = COALESCE((SELECT json_object_agg(q2.locale, q2.label) FROM public.quiz_step_content q2 WHERE q2.step_id = q1.step_id), '{}'::json),
  min_label_translations = COALESCE((SELECT json_object_agg(q2.locale, q2.min_label) FROM public.quiz_step_content q2 WHERE q2.step_id = q1.step_id AND q2.min_label IS NOT NULL), '{}'::json),
  max_label_translations = COALESCE((SELECT json_object_agg(q2.locale, q2.max_label) FROM public.quiz_step_content q2 WHERE q2.step_id = q1.step_id AND q2.max_label IS NOT NULL), '{}'::json);

-- 4. quiz_option_content: add text_translations
ALTER TABLE public.quiz_option_content ADD COLUMN IF NOT EXISTS text_translations JSON DEFAULT '{}';

-- Populate: merge all locales per option
UPDATE public.quiz_option_content q1 SET text_translations = COALESCE(
  (SELECT json_object_agg(q2.locale, q2.text) FROM public.quiz_option_content q2 WHERE q2.option_id = q1.option_id),
  '{}'::json
);
