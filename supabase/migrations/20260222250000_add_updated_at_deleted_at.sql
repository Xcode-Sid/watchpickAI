-- Add updated_at, deleted_at (and created_at where missing) to pricing and quiz tables.
-- Tables already have created_at except quiz_step_content and quiz_option_content.

-- pricing_plans: has created_at, updated_at. Add deleted_at.
ALTER TABLE public.pricing_plans ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- pricing_features: has created_at. Add updated_at, deleted_at.
ALTER TABLE public.pricing_features ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
ALTER TABLE public.pricing_features ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

DROP TRIGGER IF EXISTS update_pricing_features_updated_at ON public.pricing_features;
CREATE TRIGGER update_pricing_features_updated_at
  BEFORE UPDATE ON public.pricing_features
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- quiz_steps: has created_at. Add updated_at, deleted_at.
ALTER TABLE public.quiz_steps ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
ALTER TABLE public.quiz_steps ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

DROP TRIGGER IF EXISTS update_quiz_steps_updated_at ON public.quiz_steps;
CREATE TRIGGER update_quiz_steps_updated_at
  BEFORE UPDATE ON public.quiz_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- quiz_step_content: add created_at, updated_at, deleted_at.
ALTER TABLE public.quiz_step_content ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
ALTER TABLE public.quiz_step_content ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
ALTER TABLE public.quiz_step_content ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

DROP TRIGGER IF EXISTS update_quiz_step_content_updated_at ON public.quiz_step_content;
CREATE TRIGGER update_quiz_step_content_updated_at
  BEFORE UPDATE ON public.quiz_step_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- quiz_options: has created_at. Add updated_at, deleted_at.
ALTER TABLE public.quiz_options ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
ALTER TABLE public.quiz_options ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

DROP TRIGGER IF EXISTS update_quiz_options_updated_at ON public.quiz_options;
CREATE TRIGGER update_quiz_options_updated_at
  BEFORE UPDATE ON public.quiz_options
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- quiz_option_content: add created_at, updated_at, deleted_at.
ALTER TABLE public.quiz_option_content ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
ALTER TABLE public.quiz_option_content ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
ALTER TABLE public.quiz_option_content ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

DROP TRIGGER IF EXISTS update_quiz_option_content_updated_at ON public.quiz_option_content;
CREATE TRIGGER update_quiz_option_content_updated_at
  BEFORE UPDATE ON public.quiz_option_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
