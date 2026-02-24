import { WifiOff, Watch } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function BackendStatusBanner() {
  const { t } = useTranslation();

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-center justify-center offline-overlay-gradient backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="flex flex-col items-center gap-4 px-6 py-6 md:px-10 md:py-8 rounded-3xl bg-card/95 border border-accent/30 shadow-2xl max-w-md text-center"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        transition={{ type: "spring", damping: 20, stiffness: 220 }}
      >
        <div className="relative mb-2">
          <div className="w-16 h-16 rounded-full border-2 border-accent/60 flex items-center justify-center bg-card/80">
            <WifiOff className="w-7 h-7 text-accent animate-pulse" />
          </div>
          <div className="absolute -inset-2 rounded-full border border-accent/15 animate-pulse" />
        </div>
        <div>
          <h2 className="text-base md:text-lg font-semibold mb-1">
            {t("system.offlineTitle")}
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            {t("system.offlineBody")}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/80">
          <Watch className="w-4 h-4 text-accent" />
          <span>{t("system.offlineDetail")}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

