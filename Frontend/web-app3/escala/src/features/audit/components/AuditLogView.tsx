import Link from 'next/link';
import { Activity, History, ShieldCheck, User, Search, Filter, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
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
      {/* Premium Header */}
      <div className="rounded-3xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center gap-3 text-slate-300">
          <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
            Conformidade & Rastreabilidade
          </Badge>
          <span className="text-sm">Trilha de Auditoria Append-Only Protegida</span>
        </div>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Auditoria de Segurança
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              Rastreabilidade detalhada das ações operacionais críticas realizadas. Todas as transações são registradas em formato append-only com assinatura lógica criptográfica.
            </p>
          </div>
          <Card className="border-white/10 bg-white/5 text-white shadow-none rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-400" />
                Integridade Garantida
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-300 space-y-2">
              <p>Os registros de log são imutáveis e auditados continuamente contra violações ou manipulações lógicas no banco de dados.</p>
              <div className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1 border border-emerald-500/20">
                Assinatura Digital Ativa
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[28px] border border-slate-150 bg-white/70 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Eventos Hoje</p>
              <p className="text-3xl font-black tracking-tight text-slate-900">{data.summary.eventsToday}</p>
            </div>
            <div className="bg-blue-50 text-blue-600 rounded-xl p-3 border border-blue-100">
              <Activity className="size-5" />
            </div>
          </div>
        </Card>
        <Card className="rounded-[28px] border border-slate-150 bg-white/70 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Integridade de Logs</p>
              <p className="text-3xl font-black tracking-tight text-slate-900">{data.summary.integrityPercent}%</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 rounded-xl p-3 border border-emerald-100">
              <ShieldCheck className="size-5" />
            </div>
          </div>
        </Card>
        <Card className="rounded-[28px] border border-slate-150 bg-white/70 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Última Operação</p>
              <p className="text-sm font-bold text-slate-900 mt-2 truncate max-w-[200px]">
                {data.summary.lastEventAt ? formatDate(data.summary.lastEventAt) : 'Sem eventos'}
              </p>
            </div>
            <div className="bg-amber-50 text-amber-600 rounded-xl p-3 border border-amber-100">
              <History className="size-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Modern Filter Form */}
      <form className="bg-white/70 border border-slate-100/80 rounded-3xl p-5 shadow-sm backdrop-blur-sm grid gap-4 md:grid-cols-5 items-end">
        <div className="space-y-2">
          <Label htmlFor="actor" className="text-xs font-bold text-slate-700">Responsável (Ator)</Label>
          <Input id="actor" name="actor" defaultValue={filters.actor ?? ''} placeholder="email ou usuário" className="rounded-xl border-slate-200 focus:border-primary" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="action" className="text-xs font-bold text-slate-700">Ação</Label>
          <Input id="action" name="action" defaultValue={filters.action ?? ''} placeholder="SHIFT_SWAP, SCHEDULE_PUBLISH..." className="rounded-xl border-slate-200 focus:border-primary" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="entityType" className="text-xs font-bold text-slate-700">Tipo de Entidade</Label>
          <Input id="entityType" name="entityType" defaultValue={filters.entityType ?? ''} placeholder="ScheduleCycle, TimeRecord" className="rounded-xl border-slate-200 focus:border-primary" />
        </div>
        <input type="hidden" name="size" value={filters.size ?? 20} />
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" className="flex-1 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold gap-2">
            <Filter className="size-4" /> Filtrar
          </Button>
          <Button asChild variant="outline" className="flex-1 rounded-xl font-bold border-slate-200 hover:bg-slate-50">
            <Link href="/dashboard/auditoria">Limpar Filtros</Link>
          </Button>
        </div>
      </form>

      {/* Logs Table */}
      <Card className="rounded-[28px] border border-slate-150 bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-slate-900 text-xs">Ação</TableHead>
                <TableHead className="font-bold text-slate-900 text-xs">Ator</TableHead>
                <TableHead className="font-bold text-slate-900 text-xs">Entidade Afetada</TableHead>
                <TableHead className="font-bold text-slate-900 text-xs">Histórico / Detalhes</TableHead>
                <TableHead className="font-bold text-slate-900 text-xs">Data & Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                    <ShieldAlert className="size-8 mx-auto mb-2 text-slate-300 animate-bounce" />
                    Nenhum evento de auditoria encontrado na base de dados.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((log) => (
                  <TableRow key={log.id} className="border-slate-100 hover:bg-slate-50/30">
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold text-slate-700 bg-slate-50 border-slate-250">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-950 text-white flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black shrink-0">
                          {log.actor?.slice(0, 2).toUpperCase() || 'US'}
                        </div>
                        <span className="text-xs font-semibold text-slate-900">{log.actor}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-xs text-slate-900">{log.entityType}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.entityId ? `#${log.entityId.slice(0, 8)}...` : '-'}</div>
                    </TableCell>
                    <TableCell className="max-w-md text-xs text-slate-700 leading-relaxed">
                      {log.details ?? 'Nenhuma alteração registrada.'}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-500">
                      {formatDate(log.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Página <span className="font-bold text-slate-900">{currentPage + 1}</span> de <span className="font-bold text-slate-900">{Math.max(data.totalPages, 1)}</span>. Total de registros: <span className="font-bold text-slate-900">{data.totalElements}</span>.
        </span>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-50" disabled={currentPage <= 0}>
            <Link href={{ pathname: '/dashboard/auditoria', query: { ...filters, page: Math.max(currentPage - 1, 0) } }}>
              Anterior
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-50" disabled={currentPage >= data.totalPages - 1}>
            <Link href={{ pathname: '/dashboard/auditoria', query: { ...filters, page: currentPage + 1 } }}>
              Próxima
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
