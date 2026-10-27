import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, Checkbox, Input } from '@/components/common';
import { loginSchema, type LoginFormValues } from '@/schemas/userSchema';
import { useAuthStore } from '@/stores/authStore';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const authError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const errorRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
    // Validate on submit first, then live once the user is correcting errors.
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  useEffect(() => clearError, [clearError]);
  useEffect(() => {
    if (authError) errorRef.current?.focus();
  }, [authError]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      onSuccess();
    } catch {
      setFocus('password');
    }
  };

  return (
    // shouldFocusError (RHF default) moves focus to the first invalid field.
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4" aria-describedby="demo-creds">
      {authError && (
        <div ref={errorRef} tabIndex={-1} className="outline-none">
          <Alert variant="error" title="Sign in failed">
            {authError}. Check your details and try again.
          </Alert>
        </div>
      )}
      <Input label="Email" type="email" autoComplete="email" required error={errors.email?.message} {...register('email')} />
      <Input label="Password" type="password" autoComplete="current-password" required error={errors.password?.message} {...register('password')} />
      <Checkbox label="Keep me signed in" {...register('remember')} />
      <Button type="submit" size="lg" fullWidth isLoading={isLoading}>
        {isLoading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
