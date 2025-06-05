// src/hooks/useTranslations.js
import { useTranslation } from 'react-i18next';

export const useTranslations = () => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;
  
  return {
    t,
    changeLanguage,
    currentLanguage
  };
};