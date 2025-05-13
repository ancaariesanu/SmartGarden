import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import translationRO from "./locales/ro.json";
import translationEN from "./locales/en.json";
import translationSR from "./locales/sr.json";
import translationHU from "./locales/hu.json";

// Define available translations
const resources = {
  ro: { translation: translationRO },
  en: { translation: translationEN },
  sr: { translation: translationSR },
  hu: { translation: translationHU },
};

i18n
  .use(initReactI18next) // Initialize i18next with React
  .use(LanguageDetector) // Detect user language
  .init({
    resources,
    fallbackLng: "ro", // Default language
    supportedLngs: ["ro", "en", "sr", "hu"], // List of supported languages
    interpolation: { escapeValue: false }, // React already escapes output
    detection: {
      order: ["localStorage", "navigator"], // Detect from localStorage or browser settings
      caches: ["localStorage"], // Store user preference
    },
  });

export default i18n;
