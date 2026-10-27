import type { Paginated, User, UserInput, UserListParams } from '@/types';
import { request } from './client';

export const usersApi = {
  list: (params: UserListParams): Promise<Paginated<User>> => request('/users', { query: { ...params } }),

  get: (id: string): Promise<User> => request(`/users/${encodeURIComponent(id)}`),

  create: (input: UserInput): Promise<User> => request('/users', { method: 'POST', body: input }),

  update: (id: string, input: Partial<UserInput>): Promise<User> =>
    request(`/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: input }),

  /** Soft delete: the record stays in the DB with a timestamp and can be restored. */
  remove: (id: string): Promise<User> => request(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  restore: (id: string): Promise<User> => request(`/users/${encodeURIComponent(id)}/restore`, { method: 'POST' }),

  stats: (): Promise<{ total: number; active: number }> => request('/users/stats'),
};
