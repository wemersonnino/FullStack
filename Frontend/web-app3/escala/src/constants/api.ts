import { ENV } from './env';

export const baseUrl = ENV.IS_SERVER ? ENV.STRAPI_INTERNAL_URL : ENV.STRAPI_PUBLIC_URL;

export const API_ROUTES = {
  BANNERS: `${baseUrl}/api/banners?populate=*`,
  ARTICLES: `${baseUrl}/api/articles?populate=*`,
  FOOTER: `${baseUrl}/api/footer?populate=*`,
  MENU: `${baseUrl}/api/menus?populate=*`,
  CALENDAR: `${baseUrl}/api/calendar-events?populate=*`,
  ANNOUNCEMENTS: `${baseUrl}/api/announcements?populate=*`,
  LEGAL_PAGES: `${baseUrl}/api/legal-pages?populate=*`,
  LEAD_FORMS: `${baseUrl}/api/lead-forms?populate=*`,
  GLOBAL: `${baseUrl}/api/global?populate=*`,
  LANDING_PAGE:
    `${baseUrl}/api/landing-pages?` +
    'sort=updatedAt:desc' +
    '&populate[heroImage]=true' +
    '&populate[heroBackgroundImage]=true' +
    '&populate[sectionBackgroundImage]=true' +
    '&populate[features][sort]=order:asc' +
    '&populate[industries][sort]=order:asc' +
    '&populate[pricingPlans][sort]=order:asc' +
    '&populate[faqs][sort]=order:asc' +
    '&populate[ctaButtons][sort]=order:asc' +
    '&populate[seo]=true',
  FEATURE_SECTIONS: `${baseUrl}/api/feature-sections?filters[active][$eq]=true&sort=order:asc`,
  INDUSTRY_SECTIONS: `${baseUrl}/api/industry-sections?filters[active][$eq]=true&sort=order:asc`,
  PRICING_PLAN_CONTENTS: `${baseUrl}/api/pricing-plan-contents?filters[active][$eq]=true&sort=order:asc`,
  FAQS: `${baseUrl}/api/faqs?filters[active][$eq]=true&sort=order:asc`,
  CTA_BUTTONS: `${baseUrl}/api/cta-buttons?filters[active][$eq]=true&sort=order:asc`,
  TESTIMONIALS: `${baseUrl}/api/testimonials?sort=updatedAt:desc`,
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
  SCHEDULING_MONTH_CALENDAR: '/api/bff/scheduling/month-calendar',
  SCHEDULING_LEGENDS: '/api/bff/scheduling/legends',
  LEADS: '/api/bff/leads',
};
