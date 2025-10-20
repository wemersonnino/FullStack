// src/i18n/i18n.ts
export const locales = ['pt-BR', 'en'] as const
export const defaultLocale = 'pt-BR'

export type Locale = (typeof locales)[number]

export const i18nConfig = {
  locales,
  defaultLocale,
  timeZone: 'America/Sao_Paulo',
  formats: {
    dateTime: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'long'
      }
    }
  }
} as const
