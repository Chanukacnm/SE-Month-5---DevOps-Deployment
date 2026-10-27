import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useMemo, useState } from 'react';
import { Badge } from './Badge';
import { Table, type Column, type SortState } from './Table';

interface Row {
  id: string;
  name: string;
  email: string;
  role: string;
  joined: string;
}

const DATA: Row[] = Array.from({ length: 23 }, (_, i) => ({
  id: String(i + 1),
  name: ['Amara Perera', 'Ben Smith', 'Chen Wang', 'Dilan Silva', 'Elena Garcia', 'Farah Khan'][i % 6] + ` ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ['admin', 'editor', 'user'][i % 3],
  joined: new Date(Date.UTC(2026, i % 12, (i % 27) + 1)).toISOString().slice(0, 10),
}));

const COLUMNS: Column<Row>[] = [
  { key: 'name', header: 'Name', sortable: true, isRowHeader: true, cell: (r) => r.name },
  { key: 'email', header: 'Email', sortable: true, cell: (r) => r.email },
  { key: 'role', header: 'Role', cell: (r) => <Badge tone={r.role === 'admin' ? 'brand' : 'neutral'}>{r.role}</Badge> },
  { key: 'joined', header: 'Joined', sortable: true, cell: (r) => r.joined },
];

function SortablePaginatedTable({ pageSize = 5 }: { pageSize?: number }) {
  const [sort, setSort] = useState<SortState>({ key: 'name', direction: 'asc' });
  const [page, setPage] = useState(1);
  const sorted = useMemo(() => {
    const k = sort.key as keyof Row;
    return [...DATA].sort((a, b) => a[k].localeCompare(b[k]) * (sort.direction === 'asc' ? 1 : -1));
  }, [sort]);
  const totalPages = Math.ceil(sorted.length / pageSize);
  const rows = sorted.slice((page - 1) * pageSize, page * pageSize);
  return (
    <Table
      caption="Team members"
      columns={COLUMNS}
      rows={rows}
      rowKey={(r) => r.id}
      sort={sort}
      onSortChange={(s) => {
        setSort(s);
        setPage(1);
      }}
      pagination={{ page, totalPages, onPageChange: setPage, summary: `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, sorted.length)} of ${sorted.length}` }}
    />
  );
}

const meta = {
  title: 'Components/Table',
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SortableWithPagination: Story = {
  args: {} as never,
  render: () => <SortablePaginatedTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nameHeader = canvas.getByRole('columnheader', { name: /name/i });
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(within(nameHeader).getByRole('button'));
    await expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    await userEvent.click(canvas.getByRole('button', { name: 'Page 2' }));
    await expect(canvas.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  },
};

export const Empty: Story = {
  args: { caption: 'Team members', columns: COLUMNS as never, rows: [], rowKey: (r: never) => r, emptyState: 'No users match your search.' } as never,
};

export const Loading: Story = {
  args: { caption: 'Team members', columns: COLUMNS as never, rows: DATA.slice(0, 5) as never, rowKey: ((r: Row) => r.id) as never, isLoading: true } as never,
};
