import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Icon } from './Icon';
import { Input } from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  argTypes: { type: { control: 'select', options: ['text', 'email', 'password', 'search'] } },
  args: { label: 'Full name', placeholder: 'Jane Doe' },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {};
export const Email: Story = { args: { label: 'Email', type: 'email', placeholder: 'name@company.com', required: true } };

export const Password: Story = {
  args: { label: 'Password', type: 'password', placeholder: '' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Password');
    await userEvent.type(input, 'secret');
    await expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(canvas.getByRole('button', { name: /show password/i }));
    await expect(input).toHaveAttribute('type', 'text');
  },
};

export const WithHint: Story = { args: { label: 'Username', hint: 'Lowercase letters and numbers only.' } };

export const WithError: Story = {
  args: { label: 'Email', type: 'email', defaultValue: 'not-an-email', error: 'Enter a valid email address, like name@company.com' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Email');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(/valid email/i);
  },
};

export const WithIcon: Story = { args: { label: 'Search users', hideLabel: true, type: 'search', placeholder: 'Search…', leftIcon: <Icon name="search" size={18} /> } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'Read only value' } };
