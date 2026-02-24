import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Check, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { LoadingModal } from "@/components/LoadingModal";
import { usePricing } from "@/hooks/usePricing";
import { apiPost } from "@/lib/api";
import { getErrorMessage } from "@/lib/errorUtils";
import { translateError } from "@/lib/translateError";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  staggerContainer,
  scaleIn,
  fadeInUp,
  hoverScale,
  pageTransition,
} from "@/lib/animations";

const Pricing = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { plans, isFromApi } = usePricing(i18n.language || "en");

  const handleCheckout = async (plan: "pro" | "lifetime") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth?redirect=/pricing");
      return;
    }

    setLoadingPlan(plan);
    try {
      const { url } = await apiPost<{ url: string }>("/api/v1/payments/create-checkout", { plan });
      window.location.href = url;
    } catch (e: unknown) {
      toast({ title: t("common.error"), description: translateError(getErrorMessage(e), t), variant: "destructive" });
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <LoadingModal open={loadingPlan !== null} message={t("pricing.redirecting")} subtext={t("pricing.almostThere")} />
    <motion.div
      className="min-h-screen bg-background"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Navbar />

      <div className="pt-24 pb-16 container mx-auto px-4 max-w-3xl">
        <motion.div className="flex items-center gap-3 mb-4" variants={fadeInUp} initial="hidden" animate="show">
          <Link to="/" className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label={t("common.back")}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            {t("pricing.titleBase")} <span className="text-gradient-gold">{t("pricing.titleHighlight")}</span>
          </h1>
        </motion.div>

        <motion.p className="text-muted-foreground mb-10 max-w-md" variants={fadeInUp} initial="hidden" animate="show">
          {t("pricing.subheading")}
        </motion.p>

        <motion.div
          className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {plans.map((tier) => (
            <motion.div
              key={tier.plan}
              className={`relative p-6 rounded-2xl ${
                tier.highlighted ? "bg-card gold-border glow-gold" : "bg-card border border-border"
              }`}
              variants={scaleIn}
              whileHover={hoverScale}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                  {isFromApi ? tier.badge : t(tier.badge)}
                </span>
              )}
              <h3 className="font-display font-semibold text-xl mb-1">
                {isFromApi ? tier.name : t(tier.name)}
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground text-sm">
                  {isFromApi ? tier.period : t(tier.period)}
                </span>
              </div>
              <ul className="space-y-2 mb-6">
                {tier.features.map((f) => (
                  <li key={f.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-accent shrink-0" />{" "}
                    {isFromApi ? f.text : t(f.text)}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(tier.plan)}
                disabled={loadingPlan !== null}
                className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 ${
                  tier.highlighted
                    ? "bg-primary text-primary-foreground glow-blue"
                    : "bg-muted text-foreground"
                }`}
              >
                {isFromApi ? tier.cta : t(tier.cta)}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
    </>
  );
};

export default Pricing;
