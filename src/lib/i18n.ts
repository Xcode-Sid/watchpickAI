import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "@/locales/en.json";
import it from "@/locales/it.json";
import de from "@/locales/de.json";
import sq from "@/locales/sq.json";
import ru from "@/locales/ru.json";

const resources = {
  en: { translation: en },
  it: { translation: it },
  de: { translation: de },
  sq: { translation: sq },
  ru: { translation: ru },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "it", "de", "sq", "ru"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "watchpick_lang",
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
