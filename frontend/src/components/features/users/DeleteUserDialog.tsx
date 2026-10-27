import { useRef } from 'react';
import { Button, Modal } from '@/components/common';
import type { User } from '@/types';

interface DeleteUserDialogProps {
  user: User | null;
  onCancel: () => void;
  onConfirm: (user: User) => void;
}

/** Destructive confirmation. Initial focus goes to Cancel so Enter never deletes by accident. */
export function DeleteUserDialog({ user, onCancel, onConfirm }: DeleteUserDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <Modal
      open={Boolean(user)}
      onClose={onCancel}
      role="alertdialog"
      size="sm"
      initialFocusRef={cancelRef}
      title="Delete user?"
      description={
        user ? `${user.name} (${user.email}) will lose access immediately. The account is soft-deleted and can be restored from the Deleted filter.` : undefined
      }
      footer={
        <>
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => user && onConfirm(user)}>
            Delete user
          </Button>
        </>
      }
    />
  );
}
