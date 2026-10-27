import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * Compound component: <Card><Card.Header title="…" /><Card.Body>…</Card.Body><Card.Footer>…</Card.Footer></Card>
 * Each slot owns its own spacing and borders, so consumers only compose.
 */
function CardRoot({ className, as: Tag = 'section', ...rest }: HTMLAttributes<HTMLElement> & { as?: 'section' | 'article' | 'div' }) {
  return (
    <Tag
      className={cn(
        'flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900',
        className,
      )}
      {...rest}
    />
  );
}

interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Heading level to keep the page outline correct. */
  level?: 2 | 3;
  titleId?: string;
}

function CardHeader({ title, subtitle, actions, level = 2, titleId, className, ...rest }: CardHeaderProps) {
  const Heading = `h${level}` as const;
  return (
    <div className={cn('flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-700', className)} {...rest}>
      <div>
        <Heading id={titleId} className="text-base font-semibold text-slate-900 dark:text-white">
          {title}
        </Heading>
        {subtitle && <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-1 px-5 py-4', className)} {...rest} />;
}

function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-700', className)}
      {...rest}
    />
  );
}

export const Card = Object.assign(CardRoot, { Header: CardHeader, Body: CardBody, Footer: CardFooter });
