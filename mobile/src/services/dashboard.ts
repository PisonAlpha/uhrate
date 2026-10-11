import { api } from '@/services/api';
import type { DashboardResponse } from '@/types/dashboard';

/** The signed-in user's verification history and stats. Identity comes from the token. */
export function fetchDashboard() {
  return api.get<DashboardResponse>('/api/dashboard', { auth: true });
}
