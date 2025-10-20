import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Gera as rotas estáticas para cada idioma.
 * Necessário para build estático do Next.js.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Garante que o locale seja válido
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Necessário para renderização estática por idioma
  setRequestLocale(locale);

  // Carrega mensagens do idioma atual
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
