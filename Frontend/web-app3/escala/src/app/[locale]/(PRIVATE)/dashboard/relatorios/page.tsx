import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BarChart3 } from 'lucide-react';

export default function RelatoriosPage() {
  return (
    <div className="container mx-auto py-10 space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </Button>
      
      <div className="flex flex-col items-center justify-center h-[60vh] border rounded-xl border-dashed bg-card">
        <BarChart3 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground mt-2">Esta funcionalidade está em desenvolvimento.</p>
        <Button className="mt-6" asChild>
          <Link href="/dashboard">Voltar para o Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
