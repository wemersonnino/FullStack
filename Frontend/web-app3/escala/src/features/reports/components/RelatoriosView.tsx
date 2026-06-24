import { ArrowLeft, BarChart3, Download, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
};

export function RelatoriosView({ month, items }: RelatoriosViewProps) {
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-3 gap-2 px-0">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">Relatorios</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Folha, horas e exportacao</h1>
          <p className="text-muted-foreground">Resumo mensal gerado pela controller Relatorios.</p>
        </div>

        <form className="flex flex-wrap items-end gap-2">
          <div className="grid gap-2">
            <label htmlFor="report-month" className="text-sm font-medium">Mes</label>
            <Input id="report-month" name="month" type="month" defaultValue={month} />
          </div>
          <Button variant="outline" className="gap-2" type="submit">
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button className="gap-2" asChild>
            <a href={`/api/bff/reports/payroll/export?month=${month}`}>
              <Download className="h-4 w-4" />
              CSV
            </a>
          </Button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <SummaryCard label="Horas" value={totals.totalHours} />
        <SummaryCard label="Extras" value={totals.extraHours} />
        <SummaryCard label="Noturnas" value={totals.nightHours} />
        <SummaryCard label="Faltas" value={totals.absences} />
        <SummaryCard
          label="Custo estimado"
          value={totals.estimatedCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Horas</TableHead>
              <TableHead className="text-right">Extras</TableHead>
              <TableHead className="text-right">Noturnas</TableHead>
              <TableHead className="text-right">Faltas</TableHead>
              <TableHead className="text-right">Custo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={7}>Nenhum dado encontrado para o periodo.</TableCell></TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={`${item.employeeEmail}-${item.period}`}>
                  <TableCell className="font-medium">{item.employeeName}</TableCell>
                  <TableCell>{item.employeeEmail}</TableCell>
                  <TableCell className="text-right">{item.totalHours}</TableCell>
                  <TableCell className="text-right">{item.extraHours}</TableCell>
                  <TableCell className="text-right">{item.nightHours}</TableCell>
                  <TableCell className="text-right">{item.absences}</TableCell>
                  <TableCell className="text-right">
                    {Number(item.estimatedCost || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
