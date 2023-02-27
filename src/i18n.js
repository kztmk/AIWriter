import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEnglish from './locales/en/translation.json';
import translationJapanese from './locales/ja/translation.json';

const resources = {
  en: {
    translation: translationEnglish,
  },
  ja: {
    translation: translationJapanese,
  },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: 'ja',
    debug: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources,
    react: {
      useSuspense: false,
    },
    default: 'ja',
  });

export default i18n;
