import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Alert } from './Alert';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  argTypes: { variant: { control: 'select', options: ['info', 'success', 'warning', 'error'] } },
  args: { title: 'Heads up', children: 'Something you should know about.' },
  decorators: [(Story) => <div className="max-w-lg">{Story()}</div>],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = { args: { variant: 'info', title: 'Scheduled maintenance', children: 'The dashboard will be read-only on Sunday 02:00–03:00 UTC.' } };
export const Success: Story = { args: { variant: 'success', title: 'User created', children: 'Priya Nair was added to Engineering.' } };
export const Warning: Story = { args: { variant: 'warning', title: 'Seat limit almost reached', children: '23 of 25 seats are in use.' } };
export const Error: Story = { args: { variant: 'error', title: 'Could not save changes', children: 'A user with this email already exists.' } };
export const Dismissible: Story = { args: { variant: 'info', onDismiss: fn() } };
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert variant="info" title="Info" />
      <Alert variant="success" title="Success" />
      <Alert variant="warning" title="Warning" />
      <Alert variant="error" title="Error" />
    </div>
  ),
};
