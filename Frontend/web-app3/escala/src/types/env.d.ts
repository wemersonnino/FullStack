declare namespace NodeJS {
    interface ProcessEnv {
        readonly NEXT_PUBLIC_API_BASE_URL: string;
        readonly NEXT_PUBLIC_STRAPI_API: string;
        readonly NEXT_PUBLIC_COMPANY_SLUG: string;
        readonly NEXT_PUBLIC_RECAPTCHA_SITE_KEY: string;
        readonly NEXT_PUBLIC_GOOGLE_CLIENT_ID: string;
        readonly GOOGLE_CLIENT_ID: string;
        readonly GOOGLE_CLIENT_SECRET: string;
        readonly NEXTAUTH_SECRET: string;
        readonly NEXTAUTH_URL: string;
        readonly NODE_ENV: 'development' | 'production' | 'test';
    }
}
