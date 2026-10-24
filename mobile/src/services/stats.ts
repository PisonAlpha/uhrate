import { api } from '@/services/api';

/** How many files have been verified on UHRATE (/api/stats, public). Null if unavailable. */
export async function fetchTotalVerifications(): Promise<number | null> {
  const response = await api.get<{ success: boolean; totalVerifications: number }>('/api/stats');
  return response.success ? response.totalVerifications : null;
}
