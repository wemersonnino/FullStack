'use client';

import { ShieldCheck, History, User, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AuditoriaPage() {
  // Mock data para logs de auditoria
  const logs = [
    {
      id: 1,
      action: 'LOGIN',
      user: 'admin@escala.com',
      description: 'Usuário realizou login com sucesso.',
      timestamp: '2024-05-29 10:15:32',
      ip: '192.168.1.1',
    },
    {
      id: 2,
      action: 'UPDATE_SCHEDULE',
      user: 'manager@escala.com',
      description: 'Escala de Junho/2024 foi atualizada.',
      timestamp: '2024-05-29 09:45:10',
      ip: '192.168.1.5',
    },
    {
      id: 3,
      action: 'CREATE_EMPLOYEE',
      user: 'admin@escala.com',
      description: 'Novo colaborador João Silva cadastrado.',
      timestamp: '2024-05-28 16:20:05',
      ip: '192.168.1.1',
    }
  ];

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wide">Administração</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Auditoria e Logs</h1>
        <p className="text-muted-foreground">Rastreabilidade completa de todas as ações críticas realizadas no sistema.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">Eventos Hoje</p>
              <h3 className="text-2xl font-black">42</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">Integridade</p>
              <h3 className="text-2xl font-black">100%</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
              <History className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">Último Backup</p>
              <h3 className="text-2xl font-black text-sm">Há 2 horas</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ação</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{log.user}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{log.description}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{log.timestamp}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{log.ip}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
