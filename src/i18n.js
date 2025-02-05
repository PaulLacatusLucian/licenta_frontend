import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      videoTitle: "A quick video to summarize our school experience",
      videoDescription: "Watch this short video that captures the essence of our school...",
    },
  },
  ro: {
    translation: {
      videoTitle: "Un videoclip rapid care rezumă experiența noastră școlară",
      videoDescription: "Urmărește acest videoclip scurt care surprinde esența școlii noastre...",
    },
  },
  de: {
    translation: {
      videoTitle: "Ein kurzes Video, das unsere Schulerfahrung zusammenfasst",
      videoDescription: "Sehen Sie sich dieses kurze Video an, das das Wesen unserer Schule einfängt...",
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", 
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
