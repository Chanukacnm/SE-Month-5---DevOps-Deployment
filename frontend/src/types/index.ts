export type Role = 'admin' | 'editor' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  department: string;
  createdAt: string;
  /** Soft delete marker — deleted users are hidden from lists but restorable. */
  deletedAt: string | null;
}

export type UserInput = Pick<User, 'name' | 'email' | 'role' | 'isActive' | 'department'>;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Credentials {
  email: string;
  password: string;
  remember?: boolean;
}

export type SortDirection = 'asc' | 'desc';
export type UserSortField = 'name' | 'email' | 'role' | 'createdAt';

export interface UserListParams {
  page: number;
  pageSize: number;
  search: string;
  role: Role | 'all';
  status: 'all' | 'active' | 'inactive' | 'deleted';
  sortBy: UserSortField;
  sortDir: SortDirection;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Metric {
  id: 'users' | 'revenue' | 'orders' | 'conversion';
  label: string;
  value: number;
  format: 'number' | 'currency' | 'percent';
  /** Percentage change vs previous period. */
  change: number;
}

export interface TrendPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface Activity {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
}

export interface DashboardData {
  metrics: Metric[];
  trend: TrendPoint[];
  activity: Activity[];
}

export type NotificationKind = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message?: string;
  createdAt: string;
  read: boolean;
}

export interface Toast {
  id: string;
  kind: NotificationKind;
  title: string;
  message?: string;
}
