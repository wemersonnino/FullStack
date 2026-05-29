import { PayrollReportManager } from '@/components/dashboard/PayrollReportManager';

export const metadata = {
  title: 'Folha de Pagamento | EscalaSaaS',
};

export default function PayrollReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight italic">Relatório de <span className="text-primary">Folha</span></h1>
        <p className="text-muted-foreground font-medium">
          Visualize o fechamento mensal, horas extras e adicional noturno da sua equipe.
        </p>
      </div>
      
      <PayrollReportManager />
    </div>
  );
}
