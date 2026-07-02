import { ArrowLeft, BarChart3, Download, RefreshCcw, Coins, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PayrollItem } from '@/core/domain/models/payroll.model';

type RelatoriosViewProps = {
  month: string;
  items: PayrollItem[];
  hasError?: boolean;
};

export function RelatoriosView({ month, items, hasError }: RelatoriosViewProps) {
  const totals = items.reduce(
    (acc, item) => ({
      totalHours: acc.totalHours + Number(item.totalHours || 0),
      extraHours: acc.extraHours + Number(item.extraHours || 0),
      nightHours: acc.nightHours + Number(item.nightHours || 0),
      absences: acc.absences + Number(item.absences || 0),
      estimatedCost: acc.estimatedCost + Number(item.estimatedCost || 0),
    }),
    { totalHours: 0, extraHours: 0, nightHours: 0, absences: 0, estimatedCost: 0 }
  );

  return (
    <div className="container mx-auto space-y-6 py-8">
      {/* Back & Header */}
      <div>
        <Button variant="ghost" asChild className="mb-3 gap-2 px-0 rounded-xl hover:bg-slate-100">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-500">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Administração</span>
            </div>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Relatório Consolidado de Horas</h1>
            <p className="text-xs text-slate-500 mt-1">Cálculo de proventos operacionais, horas adicionais e custos estimados.</p>
          </div>

          <form className="flex flex-wrap items-end gap-2 bg-white/70 border border-slate-100 p-3 rounded-2xl shadow-sm backdrop-blur-sm">
            <div className="grid gap-1">
              <label htmlFor="report-month" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mês do Período</label>
              <Input id="report-month" name="month" type="month" defaultValue={month} className="h-9 rounded-xl border-slate-200 focus:border-primary text-xs" />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 rounded-xl font-bold border-slate-200" type="submit">
              <RefreshCcw className="h-3.5 w-3.5" />
              Filtrar
            </Button>
            <Button size="sm" className="gap-1.5 h-9 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold" asChild disabled={hasError || items.length === 0}>
              <a href={`/api/bff/reports/payroll/export?month=${month}`}>
                <Download className="h-3.5 w-3.5" />
                Exportar CSV
              </a>
            </Button>
          </form>
        </div>
      </div>

      {/* Graceful Error Display */}
      {hasError && (
        <Card className="border-amber-200 bg-amber-50/50 rounded-2xl shadow-sm">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900">Serviço de Relatórios Indisponível</h4>
              <p className="text-xs text-amber-700 leading-5">
                Não foi possível conectar ao motor de cálculo de proventos. Por favor, certifique-se de que o backend principal está saudável ou tente novamente em alguns instantes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
        <SummaryCard label="Horas Trabalhadas" value={totals.totalHours} icon={Clock} color="blue" />
        <SummaryCard label="Horas Extras" value={totals.extraHours} icon={Clock} color="indigo" />
        <SummaryCard label="Horas Noturnas" value={totals.nightHours} icon={Clock} color="violet" />
        <SummaryCard label="Faltas Registradas" value={totals.absences} icon={AlertTriangle} color="amber" />
        <SummaryCard
          label="Custo Estimado"
          value={totals.estimatedCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={Coins}
          color="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card className="rounded-[28px] border border-slate-150 bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-slate-900 text-xs">Funcionário</TableHead>
                <TableHead className="font-bold text-slate-900 text-xs">Email Institucional</TableHead>
                <TableHead className="text-right font-bold text-slate-900 text-xs">Horas Totais</TableHead>
                <TableHead className="text-right font-bold text-slate-900 text-xs">Horas Extras</TableHead>
                <TableHead className="text-right font-bold text-slate-900 text-xs">Horas Noturnas</TableHead>
                <TableHead className="text-right font-bold text-slate-900 text-xs">Faltas</TableHead>
                <TableHead className="text-right font-bold text-slate-900 text-xs">Custo Provedor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-500">
                    Nenhum registro de folha calculado para este período.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={`${item.employeeEmail}-${item.period}`} className="border-slate-100 hover:bg-slate-50/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-950 text-white flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black">
                          {item.employeeName?.slice(0, 2).toUpperCase() || 'US'}
                        </div>
                        <span className="text-xs font-bold text-slate-900">{item.employeeName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{item.employeeEmail}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{item.totalHours}h</TableCell>
                    <TableCell className="text-right font-mono text-xs text-indigo-700">{item.extraHours}h</TableCell>
                    <TableCell className="text-right font-mono text-xs text-violet-700">{item.nightHours}h</TableCell>
                    <TableCell className="text-right">
                      {item.absences > 0 ? (
                        <Badge className="bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-50 rounded-md text-[10px] font-bold px-1.5 py-0">
                          {item.absences} faltas
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-xs font-mono">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900 text-xs">
                      {Number(item.estimatedCost || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ 
  label, 
  value, 
  icon: Icon,
  color
}: { 
  label: string; 
  value: string | number;
  icon: any;
  color: 'blue' | 'indigo' | 'violet' | 'amber' | 'emerald';
}) {
  const themes = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <Card className="rounded-[28px] border border-slate-150 bg-white/70 backdrop-blur-sm p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="text-xl font-black text-slate-900">{value}</p>
        </div>
        <div className={`rounded-xl p-2.5 border ${themes[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}
