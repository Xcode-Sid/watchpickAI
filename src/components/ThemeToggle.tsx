import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Sun, Moon } from "lucide-react";
import { tapScale } from "@/lib/animations";

const ThemeToggle = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <motion.button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      whileTap={tapScale}
      className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      aria-label={t("themeToggle.ariaLabel")}
    >
      <Sun className="w-4 h-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </motion.button>
  );
};

export default ThemeToggle;
