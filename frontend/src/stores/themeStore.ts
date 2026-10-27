import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

export function applyTheme(theme: ThemePreference) {
  const dark = theme === 'dark' || (theme === 'system' && darkQuery().matches);
  document.documentElement.classList.toggle('dark', dark);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    { name: 'adminflow-theme' },
  ),
);

/** Keep "system" in sync when the OS theme changes while the app is open. */
export function watchSystemTheme() {
  const mq = darkQuery();
  const onChange = () => {
    if (useThemeStore.getState().theme === 'system') applyTheme('system');
  };
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}
