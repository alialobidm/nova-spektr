import { DEFAULT_LOCALE, LOCALE_KEY, Locales } from './lib/constants';
import { type ILocaleStorage, type SupportedLocale } from './lib/types';

export const useLocaleStorage = (): ILocaleStorage => ({
  setLocale: (locale: string) => {
    localStorage.setItem(LOCALE_KEY, locale);
  },

  getLocale: (): SupportedLocale => {
    const locale = localStorage.getItem(LOCALE_KEY) || Locales[navigator.language.split('-')[0]];

    return Locales[locale] || DEFAULT_LOCALE;
  },
});
