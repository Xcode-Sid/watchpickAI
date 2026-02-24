import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, ExternalLink, Watch, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  staggerContainer,
  scaleIn,
  fadeInUp,
  hoverLift,
  tapScale,
  pageTransition,
} from "@/lib/animations";

interface WatchResult {
  name: string;
  brand: string;
  price_range: string;
  case_size: string;
  reason: string;
  chrono24_url: string;
  amazon_url: string;
}

const Results = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [watches, setWatches] = useState<WatchResult[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("watchpick_results");
    if (!stored) { navigate("/quiz"); return; }
    setWatches(JSON.parse(stored));
  }, [navigate]);

  const mainWatches = watches.slice(0, 3);
  const hiddenGem = watches[3];

  return (
    <motion.div
      className="min-h-screen bg-background"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Navbar />

      <div className="pt-24 pb-16 container mx-auto px-4 max-w-4xl">
        <motion.div variants={staggerContainer} initial="hidden" animate="show">
          <motion.div className="flex items-center gap-3 mb-8" variants={fadeInUp}>
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label={t("common.back")}>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-2xl md:text-3xl font-display font-bold">{t("results.yourPicks")}</h1>
          </motion.div>

          {/* Main watch cards */}
          <motion.div className="grid md:grid-cols-3 gap-5 mb-10" variants={staggerContainer} initial="hidden" animate="show">
            {mainWatches.map((w, i) => (
              <motion.div
                key={i}
                className="rounded-2xl bg-card border border-border overflow-hidden"
                variants={scaleIn}
                whileHover={hoverLift}
              >
                <div className="w-full h-36 bg-muted flex items-center justify-center">
                  <Watch className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <div className="p-5">
                  <p className="text-xs text-accent font-medium mb-0.5">{w.brand}</p>
                  <h3 className="font-display font-semibold text-base mb-1">{w.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span>{w.price_range}</span>
                    <span>·</span>
                    <span>{w.case_size}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-3">{w.reason}</p>
                  <div className="flex gap-2">
                    <a
                      href={w.chrono24_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      Chrono24 <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={w.amazon_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-muted text-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      Amazon <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Hidden Gem */}
          {hiddenGem && (
            <motion.div
              className="rounded-2xl gold-border bg-card p-6 glow-gold"
              variants={scaleIn}
            >
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-accent" />
                <h2 className="font-display font-semibold text-lg">{t("results.hiddenGem")}</h2>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Watch className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-accent font-medium">{hiddenGem.brand}</p>
                  <h3 className="font-display font-semibold">{hiddenGem.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span>{hiddenGem.price_range}</span>
                    <span>·</span>
                    <span>{hiddenGem.case_size}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{hiddenGem.reason}</p>
                  <div className="flex gap-2">
                    <a href={hiddenGem.chrono24_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                      Chrono24 <ExternalLink className="w-3 h-3" />
                    </a>
                    <a href={hiddenGem.amazon_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                      Amazon <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Upgrade CTA */}
          <motion.div className="flex flex-col items-center mt-12 gap-4" variants={fadeInUp}>
            <motion.div whileHover={tapScale} className="inline-block">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <Crown className="w-4 h-4" /> {t("results.unlockAllPicks")}
              </Link>
            </motion.div>
            <Link to="/quiz" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("results.takeQuizAgain")}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Results;
