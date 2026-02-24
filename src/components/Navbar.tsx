import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Watch } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface NavbarProps {
  rightContent?: ReactNode;
}

const Navbar = ({ rightContent }: NavbarProps) => {
  const { t } = useTranslation();
  return (
  <motion.nav
    className="fixed top-0 left-0 right-0 z-50 bg-glass"
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ type: "spring", damping: 30, stiffness: 200 }}
  >
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <Watch className="w-6 h-6 text-accent" />
        <span className="font-display font-bold text-xl">{t("common.brand")}</span>
      </Link>
      <div className="flex items-center gap-3">
        {rightContent}
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </div>
  </motion.nav>
  );
};

export default Navbar;
