import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Watch, Zap, UserCheck, TrendingUp, Check, Star, Clock, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { LandingSkeleton } from "@/components/LandingSkeleton";
import { WatchBackground } from "@/components/WatchBackground";
import { usePricing } from "@/hooks/usePricing";
import { formatPrice } from "@/lib/currency";
import {
  staggerContainer,
  fadeInUp,
  scaleIn,
  hoverLift,
  hoverScale,
  tapScale,
  pageTransition,
} from "@/lib/animations";

const featureKeys = [
  { icon: Zap, titleKey: "landing.feature1Title", descKey: "landing.feature1Desc" },
  { icon: UserCheck, titleKey: "landing.feature2Title", descKey: "landing.feature2Desc" },
  { icon: TrendingUp, titleKey: "landing.feature3Title", descKey: "landing.feature3Desc" },
];

const sampleWatchData = [
  { name: "Omega Seamaster", brand: "Omega", usd: 5200, blur: false },
  { name: "Tudor Black Bay", brand: "Tudor", usd: 3800, blur: true },
  { name: "Grand Seiko SBGA413", brand: "Grand Seiko", usd: 5800, blur: true },
];

const Landing = () => {
  const { t, i18n } = useTranslation();
  const [ready, setReady] = useState(false);
  const locale = i18n.language || "en";
  const { plans, isFromApi } = usePricing(locale);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 350);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return <LandingSkeleton />;
  }

  return (
    <motion.div
      className="min-h-screen bg-background"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Navbar
        rightContent={
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">{t("landing.features")}</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">{t("landing.pricing")}</a>
            <Link to="/auth" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              {t("landing.getStarted")}
            </Link>
          </div>
        }
      />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <div className="hero-gradient absolute inset-0 animate-gradient" />
        <WatchBackground />
        {/* Floating ambient orbs */}
        <div className="hero-orb hero-orb-2 absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20" aria-hidden />
        <div className="hero-orb hero-orb-3 absolute top-1/3 right-1/4 w-48 h-48 bg-accent/25" aria-hidden />
        <div className="hero-orb absolute bottom-1/4 left-1/2 w-56 h-56 bg-primary/15" aria-hidden />
        <div className="relative z-10 container mx-auto px-4 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 100, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 bg-glass-gold rounded-full px-4 py-2 mb-8 animate-float">
              <Star className="w-3.5 h-3.5 text-accent" />
              <span className="text-sm text-muted-foreground">{t("landing.badge")}</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 100, delay: 0.2 }}
          >
            {t("landing.heroTitle")}
            <br />
            <span className="text-gradient-gold animate-shimmer">{t("landing.heroSubtitle")}</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 100, delay: 0.35 }}
          >
            {t("landing.heroDesc")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.45 }}
          >
            <motion.div whileHover={hoverScale} whileTap={tapScale} className="inline-block">
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg glow-blue animate-glow-pulse hover:opacity-90 transition-opacity"
              >
                {t("landing.findMyWatch")}
                <span className="text-xl">→</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Sample Watch Cards */}
          <motion.div
            className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-16"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {sampleWatchData.map((w, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={!w.blur ? hoverLift : undefined}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className={`relative rounded-2xl border border-border p-5 bg-card backdrop-blur-sm transition-shadow duration-300 ${w.blur ? "overflow-hidden" : "hover:shadow-lg hover:shadow-accent/5"}`}
              >
                {w.blur && (
                  <div className="absolute inset-0 backdrop-blur-md bg-card/60 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Watch className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{t("landing.unlockWithPro")}</span>
                  </div>
                )}
                <div className="w-full h-24 rounded-xl bg-muted mb-3 flex items-center justify-center">
                  <Watch className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <p className="font-display font-semibold text-sm">{w.name}</p>
                <p className="text-xs text-muted-foreground">{w.brand}</p>
                <p className="text-accent font-semibold text-sm mt-1">{formatPrice(w.usd, locale)}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Animated strip - fills black space with app-themed content */}
          <motion.div
            className="mt-20 md:mt-28 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {[
              { Icon: Clock, labelKey: "landing.strip60" },
              { Icon: Sparkles, labelKey: "landing.stripAI" },
              { Icon: Watch, labelKey: "landing.stripStyle" },
            ].map(({ Icon, labelKey }, i) => (
              <motion.div
                key={labelKey}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-border/50 backdrop-blur-sm"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.05 }}
              >
                <Icon className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">{t(labelKey)}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-20 section-gradient overflow-hidden">
        <WatchBackground />
        <div className="relative z-10 container mx-auto px-4">
          <motion.h2
            className="text-3xl md:text-4xl font-display font-bold text-center mb-4"
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {t("landing.whyWatchPick")}
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-center mb-12 max-w-md mx-auto"
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {t("landing.whySubtitle")}
          </motion.p>
          <motion.div
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {featureKeys.map((f, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-2xl bg-card border border-border backdrop-blur-sm gold-border-hover transition-colors"
                variants={fadeInUp}
                whileHover={hoverLift}
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{t(f.titleKey)}</h3>
                <p className="text-muted-foreground text-sm">{t(f.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-20 overflow-hidden">
        <WatchBackground />
        <div className="relative z-10 container mx-auto px-4">
          <motion.h2
            className="text-3xl md:text-4xl font-display font-bold text-center mb-12"
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {t("landing.simplePricing")}
          </motion.h2>
          <motion.div
            className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
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
                <Link
                  to="/pricing"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 ${
                    tier.highlighted
                      ? "bg-primary text-primary-foreground glow-blue"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {isFromApi ? tier.cta : t(tier.cta)}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Watch className="w-5 h-5 text-accent" />
            <span className="font-display font-bold">{t("common.brand")}</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/quiz" className="hover:text-foreground transition-colors">{t("landing.quiz")}</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">{t("landing.pricing")}</Link>
            <Link to="/auth" className="hover:text-foreground transition-colors">{t("landing.signIn")}</Link>
          </div>
          <p className="text-sm text-muted-foreground">{t("landing.copyright")}</p>
        </div>
      </footer>
    </motion.div>
  );
};

export default Landing;
