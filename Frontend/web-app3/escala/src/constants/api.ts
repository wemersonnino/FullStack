import { ENV } from './env';

export const baseUrl = ENV.IS_SERVER ? ENV.STRAPI_INTERNAL_URL : ENV.STRAPI_PUBLIC_URL;

export const API_ROUTES = {
  BANNERS: `${baseUrl}/api/banners?populate=*`,
  ARTICLES: `${baseUrl}/api/articles?populate=*`,
  FOOTER: `${baseUrl}/api/footer?populate=*`,
  MENU: `${baseUrl}/api/menus?populate=*`,
  CALENDAR: `${baseUrl}/api/calendar-events?populate=*`,
  ANNOUNCEMENTS: `${baseUrl}/api/announcements?populate=*`,
  GLOBAL: `${baseUrl}/api/global?populate=*`,
  AUTH_SERVICE: '/api/bff/auth',
  USERS: '/api/bff/users',
  UPDATE_USER_THEME: '/api/bff/users',
  EMPLOYEES: '/api/bff/employees',
  SECTORS: '/api/bff/organization/sectors',
  PROJECTS: '/api/bff/organization/projects',
  SHIFTS: '/api/bff/schedules',
  GENERATE_SHIFTS: '/api/bff/schedules/generate',
  SHIFT_SWAPS: '/api/bff/schedules/swap-requests',
  WORK_SCHEDULES: '/api/bff/schedules',
  DASHBOARD_SUMMARY: '/api/bff/schedules/dashboard-summary',
};
