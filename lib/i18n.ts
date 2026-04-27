export const defaultLocale = 'es';
export const locales = ['es', 'en', 'fr'];

export type Locale = (typeof locales)[number];

const dictionaries = {
  es: () => import('../dictionaries/es.json').then((module) => module.default),
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  fr: () => import('../dictionaries/fr.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  if (!locales.includes(locale)) {
    return dictionaries[defaultLocale as Locale]();
  }
  return dictionaries[locale]();
};
