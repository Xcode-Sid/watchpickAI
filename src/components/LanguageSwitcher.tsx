import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";
import { tapScale } from "@/lib/animations";

const languages: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "it", label: "Italiano" },
  { code: "de", label: "Deutsch" },
  { code: "sq", label: "Shqip" },
  { code: "ru", label: "Русский" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLabel = languages.find((l) => l.code === i18n.language)?.label ?? "English";

  return (
    <div className="relative" ref={ref}>
      <motion.button
        onClick={() => setOpen(!open)}
        whileTap={tapScale}
        className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 py-2 rounded-xl bg-card border border-border shadow-lg min-w-[140px] z-50"
          >
            {languages.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => {
                  i18n.changeLanguage(code);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-muted ${
                  i18n.language === code ? "bg-muted/50 font-medium text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
