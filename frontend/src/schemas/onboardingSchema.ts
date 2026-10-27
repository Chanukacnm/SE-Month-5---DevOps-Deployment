import { z } from 'zod';
import { userSchema } from './userSchema';

/**
 * Multi-step "Onboard a team member" wizard. Each step validates only its own
 * fields (via `trigger(stepFields)`) and the full schema runs on final submit.
 */
export const onboardingSchema = z
  .object({
    // Step 1 — profile
    name: userSchema.shape.name,
    email: userSchema.shape.email,
    // Step 2 — access
    role: userSchema.shape.role,
    department: userSchema.shape.department,
    permissions: z.array(z.string()).min(1, 'Select at least one permission'),
    // Step 3 — account
    sendInvite: z.boolean(),
    startDate: z.string().min(1, 'Choose a start date'),
    notes: z.string().max(280, 'Notes must be 280 characters or fewer').optional(),
    confirm: z.boolean().refine((v) => v, 'Please confirm the details are correct'),
  })
  .refine((v) => v.role === 'admin' || !v.permissions.includes('billing'), {
    message: 'Only admins can be given billing access',
    path: ['permissions'],
  });

export type OnboardingValues = z.infer<typeof onboardingSchema>;

export const ONBOARDING_STEPS = [
  { id: 'profile', title: 'Profile', fields: ['name', 'email'] },
  { id: 'access', title: 'Access', fields: ['role', 'department', 'permissions'] },
  { id: 'review', title: 'Review', fields: ['sendInvite', 'startDate', 'notes', 'confirm'] },
] as const satisfies ReadonlyArray<{ id: string; title: string; fields: ReadonlyArray<keyof OnboardingValues> }>;

export const PERMISSION_OPTIONS = [
  { value: 'users:read', label: 'View users' },
  { value: 'users:write', label: 'Manage users' },
  { value: 'reports', label: 'View reports' },
  { value: 'billing', label: 'Billing (admins only)' },
];
