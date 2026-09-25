import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n } from '../utils/i18n';

interface LocaleState {
  locale: string;
  setLocale: (locale: string) => void;
  toggleLocale: () => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: i18n.locale,
      setLocale: (locale: string) => {
        i18n.locale = locale;
        set({ locale });
      },
      toggleLocale: () => {
        const current = get().locale;
        const newLocale = current === 'en' ? 'bn' : 'en';
        i18n.locale = newLocale;
        set({ locale: newLocale });
      },
    }),
    {
      name: 'proyojon-locale',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          i18n.locale = state.locale;
        }
      },
    }
  )
);
