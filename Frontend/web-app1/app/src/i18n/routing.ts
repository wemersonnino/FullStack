/*
import { i18n } from './i18n'
import { createSharedPathnamesNavigation } from 'next-intl/navigation'

export const routing = {
  locales: i18n.locales,
  defaultLocale: i18n.defaultLocale
}

// hooks prontos para navegação internacionalizada
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(routing)
*/
import  { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['pt-BR', 'en'],
  defaultLocale: 'pt-BR',
  localePrefix: 'as-needed',
  localeDetection: true,
})