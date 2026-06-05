'use client';

import { ArrowLeftRight, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TrocasPage() {
  // Mock data for initial implementation
  const trocas = [
    {
      id: 1,
      solicitante: 'João Silva',
      dataOriginal: '2024-05-30',
      turnoOriginal: 'Manhã (08:00 - 14:00)',
      status: 'PENDENTE',
    },
    {
      id: 2,
      solicitante: 'Maria Oliveira',
      dataOriginal: '2024-06-01',
      turnoOriginal: 'Tarde (14:00 - 20:00)',
      status: 'APROVADO',
    }
  ];

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowLeftRight className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">Operacional</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Trocas de Turno</h1>
          <p className="text-muted-foreground">Gerencie as solicitações de troca de turno entre colaboradores.</p>
        </div>
        <Button className="gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          Solicitar Troca
        </Button>
      </div>

      <div className="grid gap-4">
        {trocas.map((troca) => (
          <div key={troca.id} className="flex items-center justify-between rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">{troca.solicitante}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{troca.dataOriginal} • {troca.turnoOriginal}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={troca.status === 'APROVADO' ? 'secondary' : 'outline'}>
                {troca.status}
              </Badge>
              <Button variant="ghost" size="sm">Ver Detalhes</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
