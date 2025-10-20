import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { hasLocale } from 'next-intl';

/**
 * Carrega dinamicamente as mensagens e o locale ativo
 * durante cada request no App Router.
 */
export default getRequestConfig(async ({ requestLocale }) => {
    // Verifica se o locale da requisição é suportado pela aplicação
    const locale = requestLocale && hasLocale(routing.locales, requestLocale)
        ? requestLocale
        : routing.defaultLocale;

    // Importa dinamicamente as mensagens de tradução correspondentes
    const messages = (await import(`../../messages/${locale}.json`)).default;

    return {
        locale,
        messages,
    };
});
