import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Watch, Lock, ExternalLink, Sparkles } from "lucide-react";
import { scaleIn, hoverLift } from "@/lib/animations";

export interface WatchRec {
  name: string;
  brand: string;
  price_range: string;
  case_size: string;
  reason: string;
  chrono24_url: string;
  amazon_url: string;
}

interface WatchCardProps {
  watch: WatchRec;
  index: number;
  locked: boolean;
}

const WatchCard = ({ watch, index, locked }: WatchCardProps) => {
  const { t } = useTranslation();
  return (
  <motion.div
    className={`relative rounded-2xl gold-border p-6 bg-card overflow-hidden ${!locked ? "transition-transform" : ""}`}
    variants={scaleIn}
    whileHover={!locked ? hoverLift : undefined}
  >
    {index === 3 && (
      <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium flex items-center gap-1">
        <Sparkles className="w-3 h-3" /> {t("watchCard.hiddenGem")}
      </span>
    )}

    {locked && (
      <div className="absolute inset-0 backdrop-blur-md bg-card/70 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">{t("watchCard.unlockWithPro")}</p>
        <Link
          to="/pricing"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {t("watchCard.upgrade")}
        </Link>
      </div>
    )}

    <div className="w-full h-32 rounded-xl bg-muted mb-4 flex items-center justify-center">
      <Watch className="w-12 h-12 text-muted-foreground/20" />
    </div>

    <p className="text-xs text-accent font-medium mb-1">{watch.brand}</p>
    <h3 className="font-display font-semibold text-lg mb-1">{watch.name}</h3>
    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
      <span>{watch.price_range}</span>
      <span>•</span>
      <span>{watch.case_size}</span>
    </div>
    <p className="text-sm text-muted-foreground mb-4">{watch.reason}</p>

    <div className="flex gap-2">
      <a
        href={watch.chrono24_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Chrono24 <ExternalLink className="w-3.5 h-3.5" />
      </a>
      <a
        href={watch.amazon_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Amazon <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  </motion.div>
  );
};

export default WatchCard;
