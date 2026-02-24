import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { apiPost } from "@/lib/api";
import { getErrorMessage } from "@/lib/errorUtils";
import { translateError } from "@/lib/translateError";
import { useToast } from "@/hooks/use-toast";
import { useQuiz } from "@/hooks/useQuiz";
import type { WatchResult } from "@/types/watch";
import Navbar from "@/components/Navbar";
import { LoadingModal } from "@/components/LoadingModal";
import {
  slideUp,
  hoverScale,
  tapScale,
  pageTransition,
} from "@/lib/animations";

const Quiz = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [budget, setBudget] = useState(2);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const { steps, isFromApi } = useQuiz(i18n.language || "en");

  // Map option id/text to api_value for submit
  const optionToApiValue = useMemo(() => {
    const map: Record<string, string> = {};
    steps.forEach((s) => {
      s.options.forEach((opt) => {
        map[opt.id] = opt.api_value;
        map[opt.text] = opt.api_value;
      });
    });
    return map;
  }, [steps]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth?redirect=/quiz");
        return;
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, [navigate]);

  const step = steps[currentStep];
  if (!step) return null;

  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const budgetStep = steps.find((s) => s.key === "budget");
  const budgetOptions = budgetStep?.options || [];
  const currentBudgetOption = budgetOptions[budget] || budgetOptions[2];
  const currentValue =
    step.key === "budget"
      ? isFromApi
        ? currentBudgetOption?.text
        : t(currentBudgetOption?.text || "quiz.budget.500to2000")
      : answers[step.key]
        ? isFromApi
          ? step.options.find((o) => o.id === answers[step.key])?.text
          : t(answers[step.key])
        : "";

  const canProceed = step.key === "budget" || !!answers[step.key];

  const handleSelect = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [step.key]: optionId }));
  };

  const handleNext = () => {
    if (step.key === "budget") {
      const opt = budgetOptions[budget];
      setAnswers((prev) => ({ ...prev, budget: opt?.id ?? "" }));
    }
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const toApiValue = (key: string) => (key && optionToApiValue[key]) || key || "";
    const budgetOpt = budgetOptions[budget] || budgetOptions[2];
    const budgetApiVal = answers.budget ? optionToApiValue[answers.budget] : budgetOpt?.api_value;
    const quizInputs = {
      budget: budgetApiVal || budgetOpt?.api_value || "$500–$2,000",
      occasion: toApiValue(answers.occasion),
      style: toApiValue(answers.style),
      wristSize: toApiValue(answers.wristSize),
      gender: toApiValue(answers.gender),
      brandOpenness: toApiValue(answers.brandOpenness),
      movementType: toApiValue(answers.movementType),
    };

    try {
      const data = await apiPost<{ watches: WatchResult[] }>("/api/v1/picks/generate", quizInputs);

      if (!data?.watches || data.watches.length === 0) throw new Error("No picks received");

      localStorage.setItem("watchpick_quiz", JSON.stringify(quizInputs));
      localStorage.setItem("watchpick_results", JSON.stringify(data.watches));

      navigate("/results");
    } catch (e: unknown) {
      console.error(e);
      toast({ title: t("common.error"), description: translateError(getErrorMessage(e), t), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return <LoadingModal open message={t("quiz.checkingAccess")} />;
  }

  return (
    <>
      <LoadingModal open={loading} message={t("quiz.findingPicks")} />
    <motion.div
      className="min-h-screen bg-background"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Navbar />

      <div className="pt-24 pb-16 container mx-auto px-4 max-w-xl">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 w-9 h-9 rounded-xl bg-muted justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label={t("common.back")}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>{t("quiz.stepOf", { current: currentStep + 1, total: steps.length })}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
            />
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={slideUp}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-8">
              {isFromApi ? step.label : t(step.label)}
            </h1>

            {step.type === "slider" ? (
              <div className="bg-card border border-border rounded-2xl p-8">
                <p className="text-center text-accent font-semibold text-2xl mb-6">
                  {isFromApi ? currentBudgetOption?.text : t(currentBudgetOption?.text || "quiz.budget.500to2000")}
                </p>
                <Slider
                  value={[budget]}
                  onValueChange={(v) => setBudget(v[0])}
                  min={0}
                  max={Math.max(0, budgetOptions.length - 1)}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-3">
                  <span>{isFromApi ? step.min_label : t(step.min_label || "quiz.budget.min")}</span>
                  <span>{isFromApi ? step.max_label : t(step.max_label || "quiz.budget.max")}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {step.options.map((opt) => (
                  <motion.button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    whileTap={tapScale}
                    className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-medium transition-all flex items-center justify-between ${
                      answers[step.key] === opt.id
                        ? "bg-primary/10 border-2 border-primary text-foreground"
                        : "bg-card border-2 border-transparent text-muted-foreground hover:border-border"
                    }`}
                  >
                    {isFromApi ? opt.text : t(opt.text)}
                    {answers[step.key] === opt.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 15, stiffness: 300 }}
                      >
                        <Check className="w-5 h-5 text-primary" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {currentStep > 0 && (
            <motion.button
              onClick={handleBack}
              whileHover={hoverScale}
              whileTap={tapScale}
              className="px-6 py-4 rounded-xl bg-muted text-foreground font-semibold text-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> {t("quiz.back")}
            </motion.button>
          )}

          <motion.button
            onClick={handleNext}
            disabled={!canProceed || loading}
            whileHover={canProceed && !loading ? hoverScale : undefined}
            whileTap={canProceed && !loading ? tapScale : undefined}
            className={`flex-1 py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              canProceed && !loading
                ? "bg-primary text-primary-foreground glow-blue hover:opacity-90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>{t("quiz.findingPicks")}</>
            ) : isLastStep ? (
              <>
                {t("quiz.findMyWatch")}
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                {t("quiz.next")}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default Quiz;
