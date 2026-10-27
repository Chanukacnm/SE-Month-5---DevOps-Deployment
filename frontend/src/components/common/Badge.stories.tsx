import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  argTypes: { tone: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] } },
  args: { children: 'Active', tone: 'success' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const AllTones: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge tone="neutral">User</Badge>
      <Badge tone="brand">Admin</Badge>
      <Badge tone="success">Active</Badge>
      <Badge tone="warning">Inactive</Badge>
      <Badge tone="danger">Deleted</Badge>
    </div>
  ),
};
