import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useRef, useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: { layout: 'centered' },
  args: { open: false, onClose: () => {}, title: 'Dialog title' },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

function FormModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Invite teammate"
        description="They'll get an email with a sign-in link."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Send invite</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Name" />
          <Input label="Email" type="email" />
        </div>
      </Modal>
    </>
  );
}

/** Focus moves into the dialog, Tab is trapped, Escape closes and focus returns to the trigger. */
export const WithFocusTrap: Story = {
  render: () => <FormModalDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open modal' });
    await userEvent.click(trigger);
    const dialog = within(document.body).getByRole('dialog', { name: 'Invite teammate' });
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog.contains(document.activeElement)).toBe(true);
    for (let i = 0; i < 8; i++) await userEvent.tab();
    await expect(dialog.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard('{Escape}');
    await new Promise((r) => setTimeout(r, 50));
    await expect(trigger).toHaveFocus();
  },
};

function ConfirmDemo() {
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete user
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        role="alertdialog"
        size="sm"
        initialFocusRef={cancelRef}
        title="Confirm Delete"
        description="Are you sure? John Doe will lose access immediately."
        footer={
          <>
            <Button ref={cancelRef} variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </>
        }
      />
    </>
  );
}

/** Destructive confirmation: role="alertdialog", initial focus on the safe action. */
export const ConfirmDialog: Story = { render: () => <ConfirmDemo /> };

export const OpenByDefault: Story = {
  args: {
    open: true,
    title: 'Terms updated',
    description: 'Please review the changes to our terms of service.',
    children: <p className="text-sm">We've clarified how workspace data is retained after an account is deleted.</p>,
    footer: <Button>Got it</Button>,
  },
};
