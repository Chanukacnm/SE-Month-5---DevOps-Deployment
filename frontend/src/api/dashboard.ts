import type { DashboardData } from '@/types';
import { request } from './client';

export const dashboardApi = {
  get: (): Promise<DashboardData> => request('/dashboard'),
};
