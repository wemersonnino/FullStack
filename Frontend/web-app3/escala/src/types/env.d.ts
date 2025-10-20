declare namespace NodeJS {
    interface ProcessEnv {
        readonly NEXT_PUBLIC_API_URL: string;
        readonly NEXT_PUBLIC_STRAPI_API: string;
        readonly NEXTAUTH_SECRET: string;
        readonly NEXTAUTH_URL: string;
        readonly NODE_ENV: 'development' | 'production' | 'test';
    }
}
