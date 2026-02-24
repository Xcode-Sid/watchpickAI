-- 1. Rename all *_translations to name_translations, add is_deleted
-- pricing_features: text_translations -> name_translations
ALTER TABLE public.pricing_features RENAME COLUMN text_translations TO name_translations;

-- quiz_option_content: text_translations -> name_translations
ALTER TABLE public.quiz_option_content RENAME COLUMN text_translations TO name_translations;

-- quiz_step_content: consolidate into single name_translations
-- Structure: {locale: {label, min_label, max_label}}
ALTER TABLE public.quiz_step_content ADD COLUMN IF NOT EXISTS name_translations JSON DEFAULT '{}';
UPDATE public.quiz_step_content q1 SET name_translations = sub.obj
FROM (
  SELECT step_id, COALESCE(json_object_agg(locale, json_build_object('label', label, 'min_label', min_label, 'max_label', max_label)), '{}'::json) AS obj
  FROM public.quiz_step_content
  GROUP BY step_id
) sub
WHERE q1.step_id = sub.step_id;
ALTER TABLE public.quiz_step_content DROP COLUMN IF EXISTS label_translations;
ALTER TABLE public.quiz_step_content DROP COLUMN IF EXISTS min_label_translations;
ALTER TABLE public.quiz_step_content DROP COLUMN IF EXISTS max_label_translations;

-- pricing_plans: consolidate into single name_translations
-- Structure: {locale: {name, price, period, cta, badge}}
ALTER TABLE public.pricing_plans ADD COLUMN IF NOT EXISTS name_translations JSON DEFAULT '{}';
UPDATE public.pricing_plans p1 SET name_translations = (
  SELECT COALESCE(
    (SELECT json_object_agg(p2.locale, json_build_object(
      'name', p2.name, 'price', p2.price, 'period', p2.period, 'cta', p2.cta, 'badge', p2.badge
    )) FROM public.pricing_plans p2 WHERE p2.plan = p1.plan),
    '{}'::json
  )
);
ALTER TABLE public.pricing_plans DROP COLUMN IF EXISTS price_translations;
ALTER TABLE public.pricing_plans DROP COLUMN IF EXISTS period_translations;
ALTER TABLE public.pricing_plans DROP COLUMN IF EXISTS cta_translations;
ALTER TABLE public.pricing_plans DROP COLUMN IF EXISTS badge_translations;
-- Add is_deleted (soft delete) to pricing and quiz tables
ALTER TABLE public.pricing_plans ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.pricing_features ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.quiz_steps ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.quiz_step_content ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.quiz_options ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.quiz_option_content ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_pricing_plans_is_deleted ON public.pricing_plans (is_deleted);
CREATE INDEX IF NOT EXISTS idx_pricing_features_is_deleted ON public.pricing_features (is_deleted);
CREATE INDEX IF NOT EXISTS idx_quiz_steps_is_deleted ON public.quiz_steps (is_deleted);
CREATE INDEX IF NOT EXISTS idx_quiz_step_content_is_deleted ON public.quiz_step_content (is_deleted);
CREATE INDEX IF NOT EXISTS idx_quiz_options_is_deleted ON public.quiz_options (is_deleted);
CREATE INDEX IF NOT EXISTS idx_quiz_option_content_is_deleted ON public.quiz_option_content (is_deleted);