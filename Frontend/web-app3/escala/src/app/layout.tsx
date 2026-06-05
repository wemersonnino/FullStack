import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { routing } from '@/i18n/routing';
import { getGlobal } from '@/services/global.service';
import { normalizeStrapiUrl } from '@/lib/utils';
import { AppProviders } from '@/components/shared/providers/AppProviders';
import { RecaptchaScript } from '@/components/shared/RecaptchaScript';
import { ENV } from '@/constants/env';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/**
 * SEO dinâmico baseado no schema Global do Strapi.
 */
export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobal();

  const title = global?.defaultSeo?.metaTitle || global?.siteName || 'Escala Web App';
  const description =
    global?.defaultSeo?.metaDescription || global?.siteDescription || 'Aplicação Escala Web App';
  const favicon = global?.favicon?.url
    ? normalizeStrapiUrl(global.favicon.url)
    : '/favicon.ico';

  return {
    metadataBase: new URL(ENV.APP_URL),
    title,
    description,
    icons: { icon: favicon },
    openGraph: {
      title,
      description,
      siteName: global?.siteName,
      images: favicon ? [{ url: favicon, alt: 'Favicon Escala Web App' }] : [],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return (
    <html lang={locale || routing.defaultLocale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <RecaptchaScript />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
