import { cn } from '@/utils/cn';

interface StepIndicatorProps {
  steps: ReadonlyArray<{ id: string; title: string }>;
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((step, i) => {
        const state = i < current ? 'complete' : i === current ? 'current' : 'upcoming';
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2" aria-current={state === 'current' ? 'step' : undefined}>
            <span
              aria-hidden="true"
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                state === 'complete' && 'bg-brand-700 text-white dark:bg-brand-500 dark:text-slate-950',
                state === 'current' && 'border-2 border-brand-700 text-brand-800 dark:border-brand-400 dark:text-brand-200',
                state === 'upcoming' && 'border-2 border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400',
              )}
            >
              {state === 'complete' ? '✓' : i + 1}
            </span>
            <span className={cn('text-sm font-medium', state === 'upcoming' ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white')}>
              {step.title}
              <span className="sr-only">
                {' '}
                — step {i + 1} of {steps.length}, {state}
              </span>
            </span>
            {i < steps.length - 1 && <span aria-hidden="true" className="hidden h-px flex-1 bg-slate-300 sm:block dark:bg-slate-700" />}
          </li>
        );
      })}
    </ol>
  );
}
