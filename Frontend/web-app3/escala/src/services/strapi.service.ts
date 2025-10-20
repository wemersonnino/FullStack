import { env } from '@/lib/env';
import axios from 'axios';

export const api = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL,
});

export const strapi = axios.create({
    baseURL: env.NEXT_PUBLIC_STRAPI_API,
});
