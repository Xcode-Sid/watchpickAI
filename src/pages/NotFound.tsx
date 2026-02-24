import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Watch } from "lucide-react";
import { fadeInUp, pageTransition } from "@/lib/animations";

const NotFound = () => {
  const { t } = useTranslation();
  return (
  <motion.div
    className="min-h-screen bg-background flex items-center justify-center px-4"
    variants={pageTransition}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <motion.div className="text-center" variants={fadeInUp} initial="hidden" animate="show">
      <Watch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h1 className="text-4xl font-display font-bold mb-2">{t("notFound.heading")}</h1>
      <p className="text-muted-foreground mb-6">{t("notFound.message")}</p>
      <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
        {t("notFound.goHome")}
      </Link>
    </motion.div>
  </motion.div>
  );
};

export default NotFound;
