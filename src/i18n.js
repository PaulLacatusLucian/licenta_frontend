import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import roTranslation from './locales/ro/translation.json';
import deTranslation from './locales/de/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  ro: {
    translation: roTranslation
  },
  de: {
    translation: deTranslation
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ro',
    debug: false,
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

  console.log('i18n resources:', i18n.options.resources);



export default i18n;