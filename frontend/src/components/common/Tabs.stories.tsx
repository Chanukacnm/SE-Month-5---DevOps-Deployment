import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useState } from 'react';
import { Tabs, type TabItem } from './Tabs';

const ITEMS: TabItem[] = [
  { id: 'overview', label: 'Overview', content: <p className="text-sm">Workspace overview and key numbers.</p> },
  { id: 'members', label: 'Members', content: <p className="text-sm">Everyone with access to this workspace.</p> },
  { id: 'billing', label: 'Billing', content: <p className="text-sm">Plan, invoices and payment methods.</p> },
  { id: 'audit', label: 'Audit log', content: null, disabled: true },
];

function ControlledTabs() {
  const [value, setValue] = useState('overview');
  return (
    <div className="flex flex-col gap-4">
      <Tabs label="Workspace settings" items={ITEMS} value={value} onChange={setValue} />
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Parent state: <code>{value}</code>
      </p>
    </div>
  );
}

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controlled: the parent owns `value`. Arrow keys, Home and End move between tabs. */
export const Controlled: Story = {
  args: {} as never,
  render: () => <ControlledTabs />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Overview' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Everyone with access');
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: 'Billing' })).toHaveFocus();
  },
};

export const SecondTabSelected: Story = { args: { label: 'Workspace settings', items: ITEMS, value: 'members', onChange: () => {} } };
