import { WifiOff, Watch, Wifi, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

type Variant = "offline" | "backOnline";

export function BackendStatusBanner({ variant = "offline" }: { variant?: Variant }) {
  const { t } = useTranslation();
  const isBackOnline = variant === "backOnline";

  const overlayClass = isBackOnline
    ? "fixed inset-0 z-[95] flex items-center justify-center bg-background/80 backdrop-blur-xl"
    : "fixed inset-0 z-[95] flex items-center justify-center offline-overlay-gradient backdrop-blur-xl";

  const cardClass = isBackOnline
    ? "flex flex-col items-center gap-4 px-6 py-6 md:px-10 md:py-8 rounded-3xl bg-card/95 border-2 border-green-500/60 shadow-2xl max-w-md text-center"
    : "flex flex-col items-center gap-4 px-6 py-6 md:px-10 md:py-8 rounded-3xl bg-card/95 border border-accent/30 shadow-2xl max-w-md text-center";

  const iconWrapClass = isBackOnline
    ? "w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center bg-green-500/10"
    : "w-16 h-16 rounded-full border-2 border-accent/60 flex items-center justify-center bg-card/80";

  const iconClass = isBackOnline
    ? "w-7 h-7 text-green-600 dark:text-green-400"
    : "w-7 h-7 text-accent animate-pulse";

  const titleClass = isBackOnline
    ? "text-base md:text-lg font-semibold mb-1 text-green-600 dark:text-green-400"
    : "text-base md:text-lg font-semibold mb-1";

  return (
    <motion.div
      className={overlayClass}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className={cardClass}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        transition={{ type: "spring", damping: 20, stiffness: 220 }}
      >
        <div className="relative mb-2">
          <div className={iconWrapClass}>
            {isBackOnline ? (
              <>
                <Wifi className={iconClass} />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
              </>
            ) : (
              <>
                <WifiOff className={iconClass} />
                <div className="absolute -inset-2 rounded-full border border-accent/15 animate-pulse" />
              </>
            )}
          </div>
        </div>
        <div>
          <h2 className={titleClass}>
            {isBackOnline ? t("system.backOnline") : t("system.offlineTitle")}
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            {isBackOnline
              ? t("system.backOnlineSubtitle")
              : t("system.offlineBody")}
          </p>
        </div>
        {!isBackOnline && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/80">
            <Watch className="w-4 h-4 text-accent" />
            <span>{t("system.offlineDetail")}</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

