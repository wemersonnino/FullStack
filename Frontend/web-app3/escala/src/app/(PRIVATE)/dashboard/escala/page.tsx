'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { EscalaCalendar } from '@/features/escala/components/EscalaCalendar';
import { Escala } from '@/interfaces/escala/escala.interface';
import { getEscalas, getMinhasEscalas } from '@/services/escala.service';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, ListFilter } from 'lucide-react';

export default function EscalaPage() {
  const { data: session } = useSession();
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });

  const isAdmin = session?.user?.roles?.includes('ADMIN');

  useEffect(() => {
    fetchEscalas();
  }, [dateRange, session]);

  async function fetchEscalas() {
    setIsLoading(true);
    try {
      let data: Escala[] = [];
      const start = format(dateRange.start, 'yyyy-MM-dd');
      const end = format(dateRange.end, 'yyyy-MM-dd');

      if (isAdmin) {
        data = await getEscalas({ inicio: start, fim: end });
      } else {
        data = await getMinhasEscalas(start, end);
      }
      setEscalas(data);
    } catch (error) {
      toast.error('Erro ao carregar escalas.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleDateChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Calendário de Escalas</h1>
        <p className="text-muted-foreground">
          {isAdmin 
            ? 'Visualize e gerencie a escala de toda a equipe.' 
            : 'Visualize seus dias e horários de trabalho agendados.'}
        </p>
      </div>

      <div className="h-[calc(100vh-250px)]">
        <EscalaCalendar 
          escalas={escalas} 
          isAdmin={isAdmin}
          onDateChange={handleDateChange}
          onAddEvent={() => window.location.href = '/dashboard/escala/admin'}
        />
      </div>
    </div>
  );
}
