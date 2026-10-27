import { useEffect, useState } from 'react';
import { Icon, Input, Select, Spinner } from '@/components/common';
import { useDebounce } from '@/hooks/useDebounce';
import type { UserListParams } from '@/types';

interface UserFiltersProps {
  search: string;
  role: UserListParams['role'];
  status: UserListParams['status'];
  onChange: (patch: Partial<Pick<UserListParams, 'search' | 'role' | 'status'>>) => void;
  isFetching: boolean;
}

const ROLE_FILTERS = [
  { value: 'all', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'user', label: 'User' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'deleted', label: 'Deleted' },
];

export function UserFilters({ search, role, status, onChange, isFetching }: UserFiltersProps) {
  // The input is local state so typing is instant; only the debounced value hits the URL / API.
  const [query, setQuery] = useState(search);
  const debounced = useDebounce(query, 300);

  useEffect(() => {
    if (debounced !== search) onChange({ search: debounced });
    // Intentionally only reacts to the debounced value.
  }, [debounced]);

  // Keep the box in sync with back/forward navigation.
  useEffect(() => setQuery(search), [search]);

  return (
    <div role="search" aria-label="Filter users" className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
      <div className="relative">
        <Input
          label="Search users"
          hideLabel
          type="search"
          placeholder="Search by name, email or department…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Icon name="search" size={18} />}
        />
        {isFetching && (
          <span className="absolute right-3 top-2.5 text-brand-700 dark:text-brand-300">
            <Spinner size="sm" label={null} />
          </span>
        )}
      </div>
      <Select label="Filter by role" hideLabel value={role} options={ROLE_FILTERS} onChange={(e) => onChange({ role: e.target.value as UserListParams['role'] })} />
      <Select
        label="Filter by status"
        hideLabel
        value={status}
        options={STATUS_FILTERS}
        onChange={(e) => onChange({ status: e.target.value as UserListParams['status'] })}
      />
    </div>
  );
}
