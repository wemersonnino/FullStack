'use client';

import { useState, useEffect } from 'react';
import { 
  FileDown, 
  Search, 
  Table as TableIcon, 
  PieChart, 
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { PayrollItem } from '@/core/domain/models/payroll.model';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

export function PayrollReportManager() {
  const [data, setData] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState('2026-05');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bff/reports/payroll?month=${month}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      toast.error('Erro ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    toast.info('Iniciando exportação...');
    try {
        window.open(`/api/bff/reports/payroll/export?month=${month}`, '_blank');
    } catch (error) {
        toast.error('Erro ao baixar arquivo.');
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchReport();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [month]);

  return (
    <div className="space-y-8">
      {/* 🛠 Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Período:</span>
            <Input 
              type="month" 
              value={month} 
              onChange={(e) => setMonth(e.target.value)} 
              className="w-48 h-10 rounded-xl"
            />
          </div>
          <Button variant="outline" className="rounded-xl gap-2 h-10" onClick={fetchReport}>
            <Search className="h-4 w-4" />
            Filtrar
          </Button>
        </div>

        <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl gap-2 h-10 border-primary/20 text-primary hover:bg-primary/5">
                <PieChart className="h-4 w-4" />
                Analytics
            </Button>
            <Button className="rounded-xl gap-2 h-10 shadow-lg shadow-primary/20" onClick={handleExport}>
                <FileDown className="h-4 w-4" />
                Exportar CSV
            </Button>
        </div>
      </div>

      {/* 📊 Data Grid */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold">Colaborador</TableHead>
              <TableHead className="font-bold">Total Horas</TableHead>
              <TableHead className="font-bold">Horas Extras</TableHead>
              <TableHead className="font-bold text-right">Adic. Noturno</TableHead>
              <TableHead className="font-bold text-right text-primary">Custo Estimado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground animate-pulse">
                        Processando dados da folha...
                    </TableCell>
                </TableRow>
            ) : data.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        Nenhum dado encontrado para este período.
                    </TableCell>
                </TableRow>
            ) : data.map((item, i) => (
              <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold">{item.employeeName}</span>
                    <span className="text-xs text-muted-foreground">{item.employeeEmail}</span>
                  </div>
                </TableCell>
                <TableCell>{item.totalHours}h</TableCell>
                <TableCell className="text-amber-600 font-medium">+{item.extraHours}h</TableCell>
                <TableCell className="text-right">{item.nightHours}h</TableCell>
                <TableCell className="text-right font-black text-emerald-600">
                  R$ {item.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 💡 Insights Footer */}
      <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-6">
                <h4 className="text-sm font-bold text-primary uppercase mb-2">Total da Folha (Previsto)</h4>
                <p className="text-3xl font-black text-primary">R$ {(data.reduce((acc, curr) => acc + curr.estimatedCost, 0)).toLocaleString('pt-BR')}</p>
            </div>
            <div className="rounded-2xl bg-amber-500/5 border border-amber-500/10 p-6">
                <h4 className="text-sm font-bold text-amber-600 uppercase mb-2">Total Horas Extras</h4>
                <p className="text-3xl font-black text-amber-600">{data.reduce((acc, curr) => acc + curr.extraHours, 0)}h</p>
            </div>
            <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/10 p-6">
                <h4 className="text-sm font-bold text-emerald-600 uppercase mb-2">Economia Gerada (IA)</h4>
                <p className="text-3xl font-black text-emerald-600">R$ 1.250,00</p>
            </div>
      </div>
    </div>
  );
}
