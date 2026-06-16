import { PricingTable } from '@/components/dashboard/PricingTable';
import { getPricingPlans } from '@/services/landing.service';

interface BillingPlansPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BillingPlansPage({ params }: BillingPlansPageProps) {
  const { locale } = await params;
  const plans = await getPricingPlans(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Planos e Faturamento</h1>
        <p className="text-muted-foreground">
          Escolha o plano que melhor atende às necessidades da sua empresa.
        </p>
      </div>

      <PricingTable plans={plans} />

      <div className="mt-12 rounded-lg bg-muted p-6">
        <h2 className="text-lg font-semibold">Dúvidas sobre os planos?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Entre em contato com nosso suporte para planos personalizados ou dúvidas sobre faturamento corporativo.
        </p>
      </div>
    </div>
  );
}
