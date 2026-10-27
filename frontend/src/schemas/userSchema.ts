import { z } from 'zod';

export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'user', label: 'User' },
] as const;

export const userSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name must be 60 characters or fewer'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address, like name@company.com'),
  role: z.enum(['admin', 'user', 'editor'], { errorMap: () => ({ message: 'Choose a role' }) }),
  department: z.string().min(1, 'Choose a department'),
  isActive: z.boolean(),
});

export type UserFormValues = z.infer<typeof userSchema>;

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
