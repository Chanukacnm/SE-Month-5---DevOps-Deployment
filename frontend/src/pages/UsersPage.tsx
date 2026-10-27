import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Badge, Button, Icon, Table, type Column, type SortState } from '@/components/common';
import { DeleteUserDialog } from '@/components/features/users/DeleteUserDialog';
import { UserFilters } from '@/components/features/users/UserFilters';
import { UserFormModal } from '@/components/features/users/UserFormModal';
import { PageHeader } from '@/components/layout/PageHeader';
import { useDeleteUser, useRestoreUser, useUserList } from '@/hooks/useUsers';
import { useCurrentUser } from '@/stores/authStore';
import type { User, UserListParams, UserSortField } from '@/types';
import { formatDate } from '@/utils/format';

const PAGE_SIZE = 10;

/**
 * List state (page, search, filters, sort) lives in the URL rather than a store:
 * it survives refresh, works with back/forward and can be shared as a link.
 */
function useListParams(): [UserListParams, (patch: Partial<UserListParams>) => void] {
  const [sp, setSp] = useSearchParams();
  const params: UserListParams = {
    page: Number(sp.get('page')) || 1,
    pageSize: PAGE_SIZE,
    search: sp.get('q') ?? '',
    role: (sp.get('role') as UserListParams['role']) ?? 'all',
    status: (sp.get('status') as UserListParams['status']) ?? 'all',
    sortBy: (sp.get('sort') as UserSortField) ?? 'createdAt',
    sortDir: (sp.get('dir') as UserListParams['sortDir']) ?? 'desc',
  };

  const update = useCallback(
    (patch: Partial<UserListParams>) => {
      setSp(
        (prev) => {
          const next = new URLSearchParams(prev);
          const set = (k: string, v: string | number | undefined, dflt: string | number) =>
            v === undefined ? undefined : v === dflt || v === '' ? next.delete(k) : next.set(k, String(v));
          set('q', patch.search, '');
          set('role', patch.role, 'all');
          set('status', patch.status, 'all');
          set('sort', patch.sortBy, 'createdAt');
          set('dir', patch.sortDir, 'desc');
          // Any filter change resets to page 1.
          if (patch.page !== undefined) set('page', patch.page, 1);
          else next.delete('page');
          return next;
        },
        { replace: patch.search !== undefined },
      );
    },
    [setSp],
  );

  return [params, update];
}

export default function UsersPage() {
  const [params, update] = useListParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, isFetching, isError, error, refetch } = useUserList(params);
  const deleteUser = useDeleteUser();
  const restoreUser = useRestoreUser();
  const me = useCurrentUser();
  const canEdit = me?.role === 'admin' || me?.role === 'editor';
  const canDelete = me?.role === 'admin';

  const [editing, setEditing] = useState<User | null>(null);
  const [toDelete, setToDelete] = useState<User | null>(null);
  // `?new=1` (from Quick actions) opens the create modal directly.
  const creating = searchParams.get('new') === '1';
  const setCreating = (open: boolean) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (open) next.set('new', '1');
        else next.delete('new');
        return next;
      },
      { replace: true },
    );

  const columns = useMemo<Column<User>[]>(
    () => [
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        isRowHeader: true,
        cell: (u) => (
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
            <p className="text-slate-600 sm:hidden dark:text-slate-400">{u.email}</p>
          </div>
        ),
      },
      { key: 'email', header: 'Email', sortable: true, cell: (u) => u.email, className: 'hidden sm:table-cell', headerClassName: 'hidden sm:table-cell' },
      {
        key: 'role',
        header: 'Role',
        sortable: true,
        cell: (u) => <Badge tone={u.role === 'admin' ? 'brand' : 'neutral'}>{u.role[0].toUpperCase() + u.role.slice(1)}</Badge>,
      },
      { key: 'department', header: 'Department', cell: (u) => u.department, className: 'hidden lg:table-cell', headerClassName: 'hidden lg:table-cell' },
      {
        key: 'status',
        header: 'Status',
        cell: (u) =>
          u.deletedAt ? <Badge tone="danger">Deleted</Badge> : u.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="warning">Inactive</Badge>,
      },
      {
        key: 'createdAt',
        header: 'Joined',
        sortable: true,
        cell: (u) => <time dateTime={u.createdAt}>{formatDate(u.createdAt)}</time>,
        className: 'hidden md:table-cell whitespace-nowrap',
        headerClassName: 'hidden md:table-cell',
      },
      {
        key: 'actions',
        header: <span className="sr-only">Actions</span>,
        className: 'text-right',
        cell: (u) =>
          u.deletedAt ? (
            canDelete && (
              <Button size="sm" variant="secondary" leftIcon={<Icon name="restore" size={16} />} onClick={() => restoreUser.mutate(u)}>
                Restore<span className="sr-only"> {u.name}</span>
              </Button>
            )
          ) : (
            <div className="flex justify-end gap-1">
              {canEdit && (
                <Button size="sm" variant="ghost" aria-label={`Edit ${u.name}`} onClick={() => setEditing(u)}>
                  <Icon name="pencil" size={16} />
                </Button>
              )}
              {canDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Delete ${u.name}`}
                  className="text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                  onClick={() => setToDelete(u)}
                >
                  <Icon name="trash" size={16} />
                </Button>
              )}
            </div>
          ),
      },
    ],
    [canEdit, canDelete, restoreUser],
  );

  const sort: SortState = { key: params.sortBy, direction: params.sortDir };
  const from = data ? (data.page - 1) * data.pageSize + 1 : 0;
  const to = data ? Math.min(data.page * data.pageSize, data.total) : 0;

  return (
    <>
      <PageHeader
        title="Users"
        description="Search, filter and manage everyone with access to the platform."
        actions={
          canEdit && (
            <>
              <Link
                to="/users/onboard"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <Icon name="userPlus" size={18} />
                Onboarding wizard
              </Link>
              <Button leftIcon={<Icon name="plus" size={18} />} onClick={() => setCreating(true)}>
                Add user
              </Button>
            </>
          )
        }
      />

      <div className="flex flex-col gap-4">
        <UserFilters
          search={params.search}
          role={params.role}
          status={params.status}
          isFetching={isFetching && !isLoading}
          onChange={(patch) => update(patch)}
        />

        {isError ? (
          <Alert variant="error" title="Couldn't load users">
            <p>{error.message}</p>
            <Button size="sm" variant="secondary" className="mt-2" onClick={() => refetch()}>
              Retry
            </Button>
          </Alert>
        ) : (
          <Table
            caption={params.status === 'deleted' ? 'Deleted users' : 'Users'}
            hideCaption
            columns={columns}
            rows={data?.items ?? []}
            rowKey={(u) => u.id}
            isLoading={isLoading || isFetching}
            sort={sort}
            onSortChange={(s) => update({ sortBy: s.key as UserSortField, sortDir: s.direction })}
            emptyState={
              isLoading ? 'Loading users…' : params.search ? `No users match “${params.search}”. Try a different search or clear the filters.` : 'No users found.'
            }
            pagination={
              data && {
                page: data.page,
                totalPages: data.totalPages,
                onPageChange: (page) => update({ page }),
                summary: data.total === 0 ? 'No results' : `Showing ${from}–${to} of ${data.total} users`,
              }
            }
          />
        )}
      </div>

      <UserFormModal open={creating || Boolean(editing)} user={editing} onClose={() => (editing ? setEditing(null) : setCreating(false))} />
      <DeleteUserDialog
        user={toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={(u) => {
          deleteUser.mutate(u);
          setToDelete(null);
        }}
      />
    </>
  );
}
