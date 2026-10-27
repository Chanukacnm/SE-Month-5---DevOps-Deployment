import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { departments } from '@/api/departments';
import { Alert, Button, Card, Checkbox, Input, Select } from '@/components/common';
import { errorId } from '@/components/common/Field';
import { useCreateUser } from '@/hooks/useUsers';
import { ONBOARDING_STEPS, onboardingSchema, PERMISSION_OPTIONS, type OnboardingValues } from '@/schemas/onboardingSchema';
import { ROLE_OPTIONS } from '@/schemas/userSchema';
import { StepIndicator } from './StepIndicator';

const DEFAULTS: OnboardingValues = {
  name: '',
  email: '',
  role: 'user',
  department: '',
  permissions: ['users:read'],
  sendInvite: true,
  startDate: new Date().toISOString().slice(0, 10),
  notes: '',
  confirm: false,
};

const DEPARTMENT_OPTIONS = departments.map((d) => ({ value: d, label: d }));

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const navigate = useNavigate();
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: DEFAULTS,
    mode: 'onTouched',
    shouldUnregister: false, // keep values of steps that are not mounted
  });

  // Move focus to the step heading so keyboard and screen reader users start at the top of the new step.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const current = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  const next = async () => {
    // Validate only this step's fields before moving on.
    const ok = await trigger([...current.fields], { shouldFocus: true });
    if (ok) setStep((s) => s + 1);
  };

  const onValid = async (values: OnboardingValues) => {
    await createUser.mutateAsync({ name: values.name, email: values.email, role: values.role, department: values.department, isActive: true });
    navigate('/users', { replace: true });
  };

  // Cross-field rules (e.g. billing requires admin) only run on the full schema — jump back to the step with the problem.
  const onInvalid = (errs: FieldErrors<OnboardingValues>) => {
    const idx = ONBOARDING_STEPS.findIndex((s) => s.fields.some((f) => f in errs));
    if (idx !== -1 && idx !== step) setStep(idx);
  };

  const values = watch();

  return (
    <Card className="mx-auto max-w-2xl">
      <Card.Body className="flex flex-col gap-6">
        <StepIndicator steps={ONBOARDING_STEPS} current={step} />

        <form onSubmit={handleSubmit(onValid, onInvalid)} noValidate className="flex flex-col gap-5">
          <h2 ref={headingRef} tabIndex={-1} className="text-lg font-semibold outline-none">
            Step {step + 1} of {ONBOARDING_STEPS.length}: {current.title}
          </h2>

          {createUser.isError && (
            <Alert variant="error" title="Could not create user">
              {createUser.error.message}
            </Alert>
          )}

          {step === 0 && (
            <>
              <Input label="Full name" required autoComplete="name" error={errors.name?.message} {...register('name')} />
              <Input
                label="Work email"
                type="email"
                required
                autoComplete="email"
                hint="An invitation will be sent to this address."
                error={errors.email?.message}
                {...register('email')}
              />
            </>
          )}

          {step === 1 && (
            <>
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
              <fieldset aria-describedby={errors.permissions ? errorId('permissions') : undefined}>
                <legend className="mb-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                  Permissions<span aria-hidden="true" className="text-red-700 dark:text-red-400">*</span>
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PERMISSION_OPTIONS.map((p) => (
                    <Checkbox key={p.value} label={p.label} value={p.value} {...register('permissions')} />
                  ))}
                </div>
                {errors.permissions && (
                  <p id={errorId('permissions')} className="mt-2 text-sm text-red-700 dark:text-red-400">
                    <span aria-hidden="true">⚠ </span>
                    {errors.permissions.message}
                  </p>
                )}
              </fieldset>
            </>
          )}

          {step === 2 && (
            <>
              <dl className="grid gap-x-6 gap-y-2 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2 dark:bg-slate-800/60">
                {[
                  ['Name', values.name],
                  ['Email', values.email],
                  ['Role', values.role],
                  ['Department', values.department],
                  ['Permissions', values.permissions?.join(', ')],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-slate-600 dark:text-slate-400">{k}</dt>
                    <dd className="font-medium">{v || '—'}</dd>
                  </div>
                ))}
              </dl>
              <Input label="Start date" type="date" required error={errors.startDate?.message} {...register('startDate')} />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="notes" className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Notes for the new member <span className="font-normal text-slate-600 dark:text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  aria-invalid={errors.notes ? true : undefined}
                  aria-describedby={errors.notes ? errorId('notes') : 'notes-count'}
                  className="w-full rounded-lg border border-slate-500 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-slate-500 dark:bg-slate-900"
                  {...register('notes')}
                />
                <p id="notes-count" className="text-xs text-slate-600 dark:text-slate-400">
                  {(values.notes ?? '').length}/280 characters
                </p>
                {errors.notes && (
                  <p id={errorId('notes')} className="text-sm text-red-700 dark:text-red-400">
                    {errors.notes.message}
                  </p>
                )}
              </div>
              <Checkbox label="Send invitation email now" {...register('sendInvite')} />
              <Checkbox label="I confirm these details are correct" error={errors.confirm?.message} {...register('confirm')} />
            </>
          )}

          <div className="flex justify-between gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
              Back
            </Button>
            {isLast ? (
              <Button type="submit" isLoading={isSubmitting}>
                Create and invite
              </Button>
            ) : (
              <Button onClick={next}>Continue to {ONBOARDING_STEPS[step + 1].title}</Button>
            )}
          </div>
        </form>
      </Card.Body>
    </Card>
  );
}
