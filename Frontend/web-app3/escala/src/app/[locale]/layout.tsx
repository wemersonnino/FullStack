import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Gera as rotas estáticas para cada idioma.
 * Necessário para build estático do Next.js.
 */
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Garante que o locale seja válido
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Carrega mensagens do idioma atual
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
