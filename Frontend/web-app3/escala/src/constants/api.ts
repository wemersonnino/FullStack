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
  LANDING_PAGE: `${baseUrl}/api/landing-pages?populate=*`,
  FEATURE_SECTIONS: `${baseUrl}/api/feature-sections?filters[active][$eq]=true&sort=order:asc`,
  INDUSTRY_SECTIONS: `${baseUrl}/api/industry-sections?filters[active][$eq]=true&sort=order:asc`,
  PRICING_PLAN_CONTENTS: `${baseUrl}/api/pricing-plan-contents?filters[active][$eq]=true&sort=order:asc`,
  FAQS: `${baseUrl}/api/faqs?filters[active][$eq]=true&sort=order:asc`,
  CTA_BUTTONS: `${baseUrl}/api/cta-buttons?filters[active][$eq]=true&sort=order:asc`,
  AUTH_SERVICE: '/api/bff/auth',
  USERS: '/api/server/api/v1/users',
  UPDATE_USER_THEME: '/api/server/api/v1/users',
  EMPLOYEES: '/api/server/api/v1/employees',
  SECTORS: '/api/server/api/v1/organization/sectors',
  PROJECTS: '/api/server/api/v1/organization/projects',
  SHIFTS: '/api/server/api/v1/schedules',
  GENERATE_SHIFTS: '/api/server/api/v1/schedules/generate',
  SHIFT_SWAPS: '/api/server/api/v1/schedules/swap-requests',
  WORK_SCHEDULES: '/api/server/api/v1/schedules',
  DASHBOARD_SUMMARY: '/api/server/api/v1/schedules/dashboard-summary',
  LEADS: '/api/bff/leads',
};
