import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import { notify } from '@/stores/notificationStore';
import type { Paginated, User, UserInput, UserListParams } from '@/types';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

export function useUserList(params: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.list(params),
    // Keep the old page on screen while the next one loads — no table flicker.
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ''),
    queryFn: () => usersApi.get(id!),
    enabled: Boolean(id),
  });
}

type ListSnapshot = Array<[QueryKey, Paginated<User> | undefined]>;

/** Applies `fn` to every cached user list page and returns a snapshot for rollback. */
async function patchCachedLists(qc: ReturnType<typeof useQueryClient>, fn: (page: Paginated<User>) => Paginated<User>) {
  await qc.cancelQueries({ queryKey: userKeys.lists() });
  const snapshot: ListSnapshot = qc.getQueriesData<Paginated<User>>({ queryKey: userKeys.lists() });
  qc.setQueriesData<Paginated<User>>({ queryKey: userKeys.lists() }, (old) => (old ? fn(old) : old));
  return snapshot;
}

function restore(qc: ReturnType<typeof useQueryClient>, snapshot: ListSnapshot | undefined) {
  snapshot?.forEach(([key, data]) => qc.setQueryData<Paginated<User>>(key, data));
}

const errorMessage = (err: unknown) => (err instanceof Error ? err.message : 'Something went wrong');

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UserInput) => usersApi.create(input),
    onSuccess: (user) => {
      notify({ kind: 'success', title: 'User created', message: `${user.name} was added.`, persist: true });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<UserInput> }) => usersApi.update(id, input),
    // Optimistic update: the table reflects the edit before the server replies.
    onMutate: async ({ id, input }) => {
      const snapshot = await patchCachedLists(qc, (page) => ({
        ...page,
        items: page.items.map((u) => (u.id === id ? { ...u, ...input } : u)),
      }));
      return { snapshot };
    },
    onError: (err, _vars, ctx) => {
      restore(qc, ctx?.snapshot);
      notify({ kind: 'error', title: 'Update failed', message: errorMessage(err) });
    },
    onSuccess: (user) => {
      qc.setQueryData(userKeys.detail(user.id), user);
      notify({ kind: 'success', title: 'User updated', message: `Changes to ${user.name} were saved.` });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: userKeys.lists() }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (user: User) => usersApi.remove(user.id),
    onMutate: async (user) => {
      const snapshot = await patchCachedLists(qc, (page) => ({
        ...page,
        items: page.items.filter((u) => u.id !== user.id),
        total: Math.max(0, page.total - 1),
      }));
      return { snapshot };
    },
    onError: (err, _user, ctx) => {
      restore(qc, ctx?.snapshot);
      notify({ kind: 'error', title: 'Delete failed', message: errorMessage(err) });
    },
    onSuccess: (user) => {
      notify({ kind: 'warning', title: 'User deleted', message: `${user.name} was moved to Deleted. You can restore them.`, persist: true });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useRestoreUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (user: User) => usersApi.restore(user.id),
    onSuccess: (user) => notify({ kind: 'success', title: 'User restored', message: `${user.name} is active in the directory again.` }),
    onError: (err) => notify({ kind: 'error', title: 'Restore failed', message: errorMessage(err) }),
    onSettled: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}
