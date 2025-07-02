import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationIT from './it/translation.json';
import TranslationEn from './en/translation.json';
import TranslationEs from './es/translation.json';
import TranslationDe from './de/translation.json';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      it: {
        translation: translationIT
      },
      en: {
        translation: TranslationEn
      },
      es: {
        translation: TranslationEs
      },
      de: {
        translation: TranslationDe
      }
    }
  });

export default i18n;