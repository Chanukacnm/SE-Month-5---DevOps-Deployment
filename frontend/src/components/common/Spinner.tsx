import { cn } from '@/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  /** Accessible text. Pass `null` when the spinner sits inside an element that already announces loading. */
  label?: string | null;
  className?: string;
}

const SIZES = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-10 w-10 border-[3px]' };

export function Spinner({ size = 'md', label = 'Loading', className }: SpinnerProps) {
  return (
    <span role={label ? 'status' : undefined} className={cn('inline-flex items-center', className)}>
      <span
        aria-hidden="true"
        className={cn('animate-spin rounded-full border-current border-r-transparent motion-reduce:animate-none', SIZES[size])}
      />
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-brand-700 dark:text-brand-300">
      <Spinner size="lg" label="Loading page" />
    </div>
  );
}
