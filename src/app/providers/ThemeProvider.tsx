import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from 'react';
import { useUiStore } from '@/state/uiStore';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  preference: 'system' | 'light' | 'dark';
  setMode: (nextMode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const preference = useUiStore((state) => state.theme);
  const setThemePreference = useUiStore((state) => state.setTheme);
  const [systemMode, setSystemMode] = useState<ThemeMode>(() => getSystemMode());

  const mode = preference === 'system' ? systemMode : preference;

  const setMode = useCallback(
    (nextMode: ThemeMode) => {
      setThemePreference(nextMode);
    },
    [setThemePreference]
  );

  const toggleMode = useCallback(() => {
    setThemePreference(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setThemePreference]);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemMode(event.matches ? 'dark' : 'light');
    };

    setSystemMode(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const value = useMemo(
    () => ({
      mode,
      preference,
      setMode,
      toggleMode
    }),
    [mode, preference, setMode, toggleMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme musí být použito uvnitř ThemeProvideru.');
  }

  return context;
}

function getSystemMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
