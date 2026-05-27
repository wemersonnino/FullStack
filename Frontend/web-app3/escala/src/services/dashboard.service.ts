import { API_ROUTES } from '@/constants/api';
import { httpGet } from '@/lib/http/request';

export type DashboardSummary = {
  activeEmployees: number;
  activeProjects: number;
  shiftsInMonth: number;
  pendingSwapRequests: number;
  absencesInMonth: number;
};

export async function getDashboardSummary(year: number, month: number, authToken?: string) {
  return httpGet<DashboardSummary>(
    API_ROUTES.DASHBOARD_SUMMARY,
    { year, month },
    { authToken }
  );
}
