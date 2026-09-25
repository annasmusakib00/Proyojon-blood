import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { en } from './translations/en';
import { bn } from './translations/bn';

const translations = {
  en,
  bn,
};

export const i18n = new I18n(translations);

// Set the locale once at the beginning of your app.
const locales = Localization.getLocales();
i18n.locale = locales && locales.length > 0 && locales[0].languageCode === 'bn' ? 'bn' : 'en';

// When a value is missing from a language it'll fallback to another language with the key present.
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export const t = (key: string, options?: any) => i18n.t(key, options);
