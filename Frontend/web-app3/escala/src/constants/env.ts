export const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  IS_SERVER: typeof window === "undefined",
  STRAPI_INTERNAL_URL: process.env.NEXT_PUBLIC_STRAPI_API || "http://strapi:1337",
  STRAPI_PUBLIC_URL:
    process.env.NEXT_PUBLIC_STRAPI_PUBLIC_URL || "http://localhost:1337",
};
