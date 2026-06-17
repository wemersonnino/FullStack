import type { Metadata } from 'next';
import './globals.css';
import { getGlobal } from '@/services/global.service';
import { normalizeStrapiUrl } from '@/lib/utils';
import { AppProviders } from '@/components/shared/providers/AppProviders';
import { RecaptchaScript } from '@/components/shared/RecaptchaScript';
import { ENV } from '@/constants/env';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * SEO dinâmico baseado no schema Global do Strapi.
 */
export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobal();

  const title = global?.defaultSeo?.metaTitle || global?.siteName || 'Escala Web App';
  const description =
    global?.defaultSeo?.metaDescription || global?.siteDescription || 'Aplicação Escala Web App';
  const favicon = global?.favicon?.url ? normalizeStrapiUrl(global.favicon.url) : undefined;
  const shareImage = global?.defaultSeo?.shareImage?.url || favicon;
  const icon = favicon
    ? {
        url: favicon,
        type: global?.favicon?.mime || undefined,
      }
    : undefined;

  return {
    metadataBase: new URL(ENV.APP_URL),
    title,
    description,
    icons: icon ? { icon: [icon], shortcut: [icon] } : undefined,
    openGraph: {
      title,
      description,
      siteName: global?.siteName,
      images: shareImage ? [{ url: shareImage, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: shareImage ? [shareImage] : [],
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
    <html lang={locale || 'pt-BR'} suppressHydrationWarning>
      <body className="antialiased">
        <RecaptchaScript />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
