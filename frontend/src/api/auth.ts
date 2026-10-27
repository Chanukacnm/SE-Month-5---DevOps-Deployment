import type { AuthUser, Credentials } from '@/types';
import { request } from './client';

export const authApi = {
  login: ({ email, password }: Credentials): Promise<{ user: AuthUser; token: string }> =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
};
