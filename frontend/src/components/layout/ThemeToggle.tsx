import { Icon, type IconName } from '@/components/common';
import { useThemeStore, type ThemePreference } from '@/stores/themeStore';
import { cn } from '@/utils/cn';

const OPTIONS: Array<{ value: ThemePreference; label: string; icon: IconName }> = [
  { value: 'light', label: 'Light theme', icon: 'sun' },
  { value: 'dark', label: 'Dark theme', icon: 'moon' },
  { value: 'system', label: 'System theme', icon: 'monitor' },
];

/** Segmented control implemented as a radio group so the current choice is announced. */
export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <fieldset className="flex items-center rounded-lg border border-slate-300 p-0.5 dark:border-slate-600">
      <legend className="sr-only">Colour theme</legend>
      {OPTIONS.map((opt) => (
        <label
          key={opt.value}
          title={opt.label}
          className={cn(
            'cursor-pointer rounded-md p-1.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600',
            theme === opt.value
              ? 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-100'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
          )}
        >
          <input type="radio" name="theme" value={opt.value} checked={theme === opt.value} onChange={() => setTheme(opt.value)} className="sr-only" />
          <Icon name={opt.icon} size={18} />
          <span className="sr-only">{opt.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
