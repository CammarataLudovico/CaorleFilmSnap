import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationIT from '../../locales/it/translation.json';
import translationEN from '../../locales/en/translation.json';
import translationES from '../../locales/es/translation.json';
import translationDE from '../../locales/de/translation.json';

const supported = ['it', 'en', 'es', 'de'];
const browserLang = navigator.language.split('-')[0];
const lng = supported.includes(browserLang) ? browserLang : 'en';

i18n.use(initReactI18next).init({
  lng,
  fallbackLng: 'en',
  resources: {
    it: { translation: translationIT },
    en: { translation: translationEN },
    es: { translation: translationES },
    de: { translation: translationDE },
  },
});

export default i18n;
