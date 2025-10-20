import axios from 'axios';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export function setApiLocale(locale: string) {
    api.defaults.headers['Accept-Language'] = locale;
}
