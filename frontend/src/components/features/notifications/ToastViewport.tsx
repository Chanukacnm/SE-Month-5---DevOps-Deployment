import { Icon } from '@/components/common';
import { useNotificationStore } from '@/stores/notificationStore';
import { cn } from '@/utils/cn';
import { KIND_STYLES } from './kindStyles';

/**
 * Toast stack. The live regions are always mounted (an aria-live region that
 * appears together with its content is often not announced). Errors go to the
 * assertive region, everything else to the polite one.
 */
export function ToastViewport() {
  const toasts = useNotificationStore((s) => s.toasts);
  const dismiss = useNotificationStore((s) => s.dismissToast);

  const render = (assertive: boolean) =>
    toasts
      .filter((t) => (t.kind === 'error') === assertive)
      .map((t) => {
        const style = KIND_STYLES[t.kind];
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex w-full gap-3 rounded-lg border border-l-4 border-slate-200 bg-white p-4 shadow-lg motion-safe:animate-slide-in dark:border-slate-700 dark:bg-slate-900',
              style.border,
            )}
          >
            <Icon name={style.icon} className={cn('mt-0.5 shrink-0', style.text)} />
            <div className="flex-1 text-sm">
              <p className="font-semibold">
                <span className="sr-only">{style.label}: </span>
                {t.title}
              </p>
              {t.message && <p className="mt-0.5 text-slate-600 dark:text-slate-300">{t.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label={`Dismiss notification: ${t.title}`}
              className="-m-1 h-8 w-8 shrink-0 rounded-md p-1.5 text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        );
      });

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:left-auto sm:w-96">
      <div role="status" aria-live="polite" className="flex w-full flex-col gap-2">
        {render(false)}
      </div>
      <div role="alert" aria-live="assertive" className="flex w-full flex-col gap-2">
        {render(true)}
      </div>
    </div>
  );
}
