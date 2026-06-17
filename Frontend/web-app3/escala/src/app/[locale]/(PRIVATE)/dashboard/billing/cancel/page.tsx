import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function BillingCancelPage() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6 text-center">
      <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
        <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Pagamento Cancelado</h1>
        <p className="max-w-md text-muted-foreground">
          O processo de assinatura foi interrompido. Nenhuma cobrança foi realizada.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/dashboard/billing/plans">Tentar Novamente</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">Voltar ao Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
