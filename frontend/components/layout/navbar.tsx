'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  const t = useTranslations('nav');

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              Escala
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/dashboard" className="hover:text-primary">
                {t('home')}
              </Link>
              <Link href="/users" className="hover:text-primary">
                {t('users')}
              </Link>
              <Link href="/shifts" className="hover:text-primary">
                {t('shifts')}
              </Link>
              <Link href="/schedules" className="hover:text-primary">
                {t('schedules')}
              </Link>
              <Link href="/announcements" className="hover:text-primary">
                {t('announcements')}
              </Link>
              <Link href="/audit" className="hover:text-primary">
                {t('audit')}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
