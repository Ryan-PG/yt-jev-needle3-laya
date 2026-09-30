import { useCallback, useEffect, useState } from 'react';

/**
 * Theme preference: light, dark, or follow the operating system.
 *
 * This is the only thing the app writes to local storage. It is a display
 * preference, never a credential — API keys and tokens are deliberately excluded
 * from storage entirely.
 */

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'book-benchmark-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function isPreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function readStoredTheme(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isPreference(stored) ? stored : 'system';
  } catch {
    // Storage can be unavailable (private mode, blocked site data).
    return 'system';
  }
}

function storeTheme(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    /* Not being able to remember the choice is not worth breaking the page over. */
  }
}

function prefersDark(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches;
}

export function resolveIsDark(preference: ThemePreference): boolean {
  if (preference === 'system') return prefersDark();
  return preference === 'dark';
}

function applyTheme(preference: ThemePreference): void {
  const dark = resolveIsDark(preference);
  document.documentElement.classList.toggle('dark', dark);
  // Keeps native scrollbars and form controls in the same theme.
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

export interface ThemeControl {
  preference: ThemePreference;
  isDark: boolean;
  setPreference: (preference: ThemePreference) => void;
}

export function useTheme(): ThemeControl {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredTheme);
  const [isDark, setIsDark] = useState<boolean>(() => resolveIsDark(readStoredTheme()));

  useEffect(() => {
    applyTheme(preference);
    storeTheme(preference);
    setIsDark(resolveIsDark(preference));

    // While following the system, react to the OS switching theme.
    if (preference !== 'system' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(DARK_QUERY);
    const onChange = (): void => {
      applyTheme('system');
      setIsDark(prefersDark());
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
  }, []);

  return { preference, isDark, setPreference };
}
