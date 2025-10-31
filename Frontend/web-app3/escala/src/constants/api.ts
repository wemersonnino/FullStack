import { ENV } from './env';

export const baseUrl = ENV.IS_SERVER
  ? ENV.STRAPI_INTERNAL_URL
  : ENV.STRAPI_PUBLIC_URL;


export const API_ROUTES = {
  BANNERS: `${baseUrl}/api/Banners?populate=*`,
  ARTICLES: `${baseUrl}/api/articles?populate=*`,
  FOOTER: `${baseUrl}/api/footer?populate=*`,
  MENU: `${baseUrl}/api/menus?populate=*`,
};
