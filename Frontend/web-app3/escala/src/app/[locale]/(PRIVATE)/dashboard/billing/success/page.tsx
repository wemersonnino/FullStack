import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getLandingPage } from '@/services/landing.service';

interface BillingSuccessPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BillingSuccessPage({ params }: BillingSuccessPageProps) {
  const { locale } = await params;
  const landing = await getLandingPage(locale);

  // Here we can use general success messages from Strapi if they exist
  // For now, using the ones specified by the user but prepared for localization/strapi
  
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6 text-center">
      <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Assinatura Realizada!</h1>
        <p className="max-w-md text-muted-foreground">
          Obrigado por assinar a Plataforma Escala. Seu plano foi atualizado e todas as funcionalidades já estão disponíveis.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/dashboard">Ir para o Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
