import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translations from './translations'; // Import your translation files

// Initialize i18next
i18n.use(initReactI18next).init({
  resources: translations,
  lng: 'en', // Set default language
  fallbackLng: 'en', // Fallback language in case translation is missing
  interpolation: {
    escapeValue: false,
  },
});

// Shorthand function for translation
export const t = i18n.t.bind(i18n);

export default i18n;
