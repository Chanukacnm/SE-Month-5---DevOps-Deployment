import type { ReactNode } from 'react';
import type { SortDirection } from '@/types';
import { cn } from '@/utils/cn';
import { Icon } from './Icon';
import { Pagination, type PaginationProps } from './Pagination';

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  /** Use for the column that names the row; rendered as <th scope="row">. */
  isRowHeader?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface TableProps<T> {
  caption: ReactNode;
  /** Visually hide the caption while keeping it for screen readers. */
  hideCaption?: boolean;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  pagination?: PaginationProps;
  isLoading?: boolean;
  emptyState?: ReactNode;
  className?: string;
}

const ariaSort = (active: boolean, dir: SortDirection) => (active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none');

/**
 * Data table with sortable column headers (buttons inside <th>, state exposed
 * through aria-sort) and optional pagination. Generic over the row type.
 */
export function Table<T>({
  caption,
  hideCaption,
  columns,
  rows,
  rowKey,
  sort,
  onSortChange,
  pagination,
  isLoading,
  emptyState = 'No results',
  className,
}: TableProps<T>) {
  const toggleSort = (key: string) => {
    const direction: SortDirection = sort?.key === key && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange?.({ key, direction });
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="relative overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700" tabIndex={0} role="region" aria-label="Scrollable table">
        {/* Loading is shown as a bar rather than dimmed rows, which would break text contrast. */}
        {isLoading && (
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 overflow-hidden">
            <div className="h-full w-1/3 animate-[loading-bar_1s_ease-in-out_infinite] bg-brand-600 motion-reduce:w-full motion-reduce:animate-pulse dark:bg-brand-400" />
          </div>
        )}
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-700" aria-busy={isLoading || undefined}>
          <caption className={cn('px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300', hideCaption && 'sr-only')}>
            {caption}
          </caption>
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              {columns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={col.sortable ? ariaSort(active, sort?.direction ?? 'asc') : undefined}
                    className={cn('whitespace-nowrap px-4 py-3 font-semibold text-slate-700 dark:text-slate-200', col.headerClassName)}
                  >
                    {col.sortable && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className="-mx-1 inline-flex items-center gap-1 rounded px-1 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:hover:text-brand-300"
                      >
                        {col.header}
                        <Icon
                          name={active ? (sort!.direction === 'asc' ? 'chevronUp' : 'chevronDown') : 'sort'}
                          size={14}
                          className={active ? '' : 'opacity-60'}
                        />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={cn('divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900')}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-600 dark:text-slate-400">
                  {emptyState}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  {columns.map((col) => {
                    const Cell = col.isRowHeader ? 'th' : 'td';
                    return (
                      <Cell
                        key={col.key}
                        scope={col.isRowHeader ? 'row' : undefined}
                        className={cn('px-4 py-3 align-middle font-normal text-slate-800 dark:text-slate-200', col.className)}
                      >
                        {col.cell(row)}
                      </Cell>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 0 && <Pagination {...pagination} />}
    </div>
  );
}
