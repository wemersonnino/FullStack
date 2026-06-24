import Link from 'next/link';
import { Activity, History, ShieldCheck, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AuditLogFilters, AuditLogPage } from '@/core/domain/models/audit-log.model';

type AuditLogViewProps = {
  data: AuditLogPage;
  filters: AuditLogFilters;
};

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value));
}

export function AuditLogView({ data, filters }: AuditLogViewProps) {
  const currentPage = data.page ?? 0;

  return (
    <section className="container mx-auto space-y-6 py-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="size-5" />
          <span className="text-sm font-medium uppercase">Administração</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Auditoria e Logs</h1>
        <p className="text-muted-foreground">Rastreabilidade das ações críticas registradas para a empresa autenticada.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Activity className="size-5 text-blue-600" />
              <CardTitle className="text-sm text-muted-foreground">Eventos Hoje</CardTitle>
            </div>
            <div className="text-3xl font-bold">{data.summary.eventsToday}</div>
          </CardHeader>
        </Card>
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-emerald-600" />
              <CardTitle className="text-sm text-muted-foreground">Integridade</CardTitle>
            </div>
            <div className="text-3xl font-bold">{data.summary.integrityPercent}%</div>
          </CardHeader>
        </Card>
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <History className="size-5 text-amber-600" />
              <CardTitle className="text-sm text-muted-foreground">Último Evento</CardTitle>
            </div>
            <div className="text-sm font-medium">{formatDate(data.summary.lastEventAt)}</div>
          </CardHeader>
        </Card>
      </div>

      <form className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-5">
        <div className="space-y-1">
          <Label htmlFor="actor">Ator</Label>
          <Input id="actor" name="actor" defaultValue={filters.actor ?? ''} placeholder="email ou usuário" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="action">Ação</Label>
          <Input id="action" name="action" defaultValue={filters.action ?? ''} placeholder="SHIFT, REBAC..." />
        </div>
        <div className="space-y-1">
          <Label htmlFor="entityType">Entidade</Label>
          <Input id="entityType" name="entityType" defaultValue={filters.entityType ?? ''} placeholder="WorkShift" />
        </div>
        <input type="hidden" name="size" value={filters.size ?? 20} />
        <div className="flex items-end gap-2 md:col-span-2">
          <Button type="submit">Filtrar</Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/auditoria">Limpar</Link>
          </Button>
        </div>
      </form>

      <Card className="rounded-lg shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ação</TableHead>
                <TableHead>Ator</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>Data/Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhum evento de auditoria encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="size-3 text-muted-foreground" />
                        <span className="text-sm">{log.actor}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{log.entityType}</div>
                      <div className="text-xs text-muted-foreground">{log.entityId ? `#${log.entityId}` : '-'}</div>
                    </TableCell>
                    <TableCell className="max-w-md text-sm">{log.details ?? '-'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Página {currentPage + 1} de {Math.max(data.totalPages, 1)}. Total: {data.totalElements}.
        </span>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" disabled={currentPage <= 0}>
            <Link href={{ pathname: '/dashboard/auditoria', query: { ...filters, page: Math.max(currentPage - 1, 0) } }}>
              Anterior
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" disabled={currentPage >= data.totalPages - 1}>
            <Link href={{ pathname: '/dashboard/auditoria', query: { ...filters, page: currentPage + 1 } }}>
              Próxima
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
