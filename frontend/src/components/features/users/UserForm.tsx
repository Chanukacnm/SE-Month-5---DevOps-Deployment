import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { departments } from '@/api/departments';
import { Alert, Checkbox, Input, Select } from '@/components/common';
import { ROLE_OPTIONS, userSchema, type UserFormValues } from '@/schemas/userSchema';

export const EMPTY_USER: UserFormValues = { name: '', email: '', role: 'user', department: '', isActive: true };

interface UserFormProps {
  id: string;
  defaultValues?: UserFormValues;
  onSubmit: (values: UserFormValues) => Promise<unknown>;
  /** Server-side error (e.g. duplicate email) to show above the fields. */
  serverError?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

const DEPARTMENT_OPTIONS = departments.map((d) => ({ value: d, label: d }));

/**
 * Shared create/edit form. The submit button lives in the modal footer and
 * targets this form via the `form` attribute, so the form is reusable outside modals.
 */
export function UserForm({ id, defaultValues = EMPTY_USER, onSubmit, serverError, onDirtyChange }: UserFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues,
    mode: 'onTouched',
  });

  useEffect(() => onDirtyChange?.(isDirty), [isDirty, onDirtyChange]);

  // Map a known server error onto the field it belongs to.
  useEffect(() => {
    if (serverError?.toLowerCase().includes('email')) setError('email', { type: 'server', message: serverError }, { shouldFocus: true });
  }, [serverError, setError]);

  const errorCount = Object.keys(errors).length;

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {errorCount > 1 && (
        <Alert variant="error" title={`Please fix ${errorCount} errors`}>
          Each field with a problem is marked below.
        </Alert>
      )}
      {serverError && !serverError.toLowerCase().includes('email') && <Alert variant="error">{serverError}</Alert>}

      <Input label="Full name" autoComplete="off" required error={errors.name?.message} {...register('name')} />
      <Input label="Email" type="email" autoComplete="off" required error={errors.email?.message} {...register('email')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Role" required options={ROLE_OPTIONS} error={errors.role?.message} {...register('role')} />
        <Select
          label="Department"
          required
          placeholder="Select a department"
          options={DEPARTMENT_OPTIONS}
          error={errors.department?.message}
          {...register('department')}
        />
      </div>
      <Checkbox label="Active account" description="Inactive users can't sign in but keep their data." {...register('isActive')} />
    </form>
  );
}
