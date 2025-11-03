import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { routing } from '@/i18n/routing';
import { getGlobal } from '@/services/global.service';
import { normalizeImageUrlStrapi } from '@/lib/utils';

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
    ? normalizeImageUrlStrapi(global.favicon.url)
    : '/favicon.ico';

  return {
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
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
