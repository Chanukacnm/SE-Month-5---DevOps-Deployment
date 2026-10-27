import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Pagination } from './Pagination';

function Demo({ totalPages }: { totalPages: number }) {
  const [page, setPage] = useState(1);
  return <Pagination page={page} totalPages={totalPages} onPageChange={setPage} summary={`Page ${page} of ${totalPages}`} />;
}

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FewPages: Story = { args: {} as never, render: () => <Demo totalPages={5} /> };
export const ManyPages: Story = { args: {} as never, render: () => <Demo totalPages={14} /> };
