import { getRequestConfig } from 'next-intl/server'
import { i18n } from './i18n'

export default getRequestConfig(async ({ locale }) => {
  // fallback caso locale inválido
  if (!i18n.locales.includes(locale as any)) {
    locale = i18n.defaultLocale
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  }
})
