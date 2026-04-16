import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { translations } from '../i18n/translations';

const STORAGE_KEY = 'fittrack.mobile.settings.v1';

const themePalette = {
  light: {
    background: '#F3F4F6',
    card: '#FFFFFF',
    text: '#111827',
    mutedText: '#6B7280',
    border: '#E5E7EB',
    tint: '#7A30FF',
  },
  dark: {
    background: '#0B1220',
    card: '#111827',
    text: '#F9FAFB',
    mutedText: '#9CA3AF',
    border: '#1F2937',
    tint: '#A78BFA',
  },
};

const SettingsContext = createContext({
  language: 'fr',
  themeMode: 'light',
  colors: themePalette.light,
  setLanguage: () => {},
  setThemeMode: () => {},
  t: (key) => key,
});

export function SettingsProvider({ children }) {
  const [language, setLanguage] = useState('fr');
  const [themeMode, setThemeMode] = useState('light');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw || !mounted) {
          return;
        }
        const parsed = JSON.parse(raw);
        if (parsed?.language === 'fr' || parsed?.language === 'en') {
          setLanguage(parsed.language);
        }
        if (parsed?.themeMode === 'light' || parsed?.themeMode === 'dark') {
          setThemeMode(parsed.themeMode);
        }
      } catch (error) {
        // Ignore corrupted storage and keep defaults.
      } finally {
        if (mounted) {
          setIsHydrated(true);
        }
      }
    }

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ language, themeMode })
    ).catch(() => {
      // Best effort persistence.
    });
  }, [language, themeMode, isHydrated]);

  const t = useMemo(() => {
    return (key) => {
      const current = translations[language] || translations.fr;
      const fallback = translations.en || {};
      return current[key] || fallback[key] || key;
    };
  }, [language]);

  const value = useMemo(() => {
    return {
      language,
      themeMode,
      setLanguage,
      setThemeMode,
      t,
      colors: themePalette[themeMode] || themePalette.light,
    };
  }, [language, themeMode, t]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
