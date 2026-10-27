import { useState } from 'react';
import { Button, Modal } from '@/components/common';
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers';
import type { UserFormValues } from '@/schemas/userSchema';
import type { User } from '@/types';
import { UserForm } from './UserForm';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  /** When set, the modal edits this user; otherwise it creates a new one. */
  user?: User | null;
}

const FORM_ID = 'user-form';

export function UserFormModal({ open, onClose, user }: UserFormModalProps) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = Boolean(user);
  const pending = createUser.isPending || updateUser.isPending;

  const close = () => {
    setServerError(null);
    onClose();
  };

  const onSubmit = async (values: UserFormValues) => {
    setServerError(null);
    try {
      if (user) {
        // Optimistic: close immediately; the table already shows the change and rolls back on error.
        updateUser.mutate({ id: user.id, input: values });
        close();
      } else {
        await createUser.mutateAsync(values);
        close();
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not save user');
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={isEdit ? `Edit ${user!.name}` : 'Add user'}
      description={isEdit ? 'Update profile details and access.' : 'Create a new account. Fields marked * are required.'}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={pending}>
            {isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </>
      }
    >
      {/* key resets the form when switching between users */}
      <UserForm
        key={user?.id ?? 'new'}
        id={FORM_ID}
        defaultValues={user ? { name: user.name, email: user.email, role: user.role, department: user.department, isActive: user.isActive } : undefined}
        onSubmit={onSubmit}
        serverError={serverError}
      />
    </Modal>
  );
}
