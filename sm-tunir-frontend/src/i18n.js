
import i18n from "i18next";
import { initReactI18next } from "react-i18next";


// Importing translation files

import translationEN from "./locales/en/translation.json";
import translationFR from "./locales/fr/translation.json";
import translationIT from "./locales/it/translation.json";
import translationAR from "./locales/ar/translation.json";
import translationWF from "./locales/wolof/translation.json";


//Creating object with the variables of imported translation files
const resources = {
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR,
  },
  it: {
    translation: translationIT,
  },
  ar: {
    translation: translationAR,
  },
  wf:{
    translation: translationWF,

  }
};

//i18N Initialization

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng:localStorage.getItem("local") || 'en', //default language
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;