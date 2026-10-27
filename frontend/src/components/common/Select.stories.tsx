import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'user', label: 'User' },
];

const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'Support', 'Finance', 'Operations'].map((d) => ({ value: d, label: d }));

const meta = {
  title: 'Components/Select',
  component: Select,
  args: { label: 'Role', options: ROLES },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {};
export const WithPlaceholder: Story = { args: { label: 'Department', options: DEPARTMENTS, placeholder: 'Select a department', defaultValue: '' } };
export const MultiSelect: Story = {
  args: { label: 'Departments', options: DEPARTMENTS, multiple: true, defaultValue: ['Sales', 'Support'], size: 6 } as never,
};
export const WithError: Story = { args: { label: 'Department', options: DEPARTMENTS, placeholder: 'Select a department', defaultValue: '', error: 'Choose a department', required: true } };
export const Disabled: Story = { args: { disabled: true } };
