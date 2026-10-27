import { cn } from '@/utils/cn';

/** Decorative placeholder. The surrounding region should carry aria-busy / a status message. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-slate-200 motion-reduce:animate-none dark:bg-slate-800', className)} />;
}
