'use client';

import { useState } from 'react';
import { WorkSchedule } from '@/interfaces/shift/work-schedule.interface';
import { WorkScheduleCard } from './WorkScheduleCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarRange } from 'lucide-react';

interface WorkScheduleModalProps {
  schedules: WorkSchedule[];
}

export const WorkScheduleModal = ({ schedules }: WorkScheduleModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeSchedule = schedules.find((s) => s.active) || schedules[0];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Ver Horário Fixo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Seu Horário Padrão</DialogTitle>
          <DialogDescription>
            Aqui você pode consultar sua escala recorrente e regras de frequência.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {activeSchedule ? (
            <WorkScheduleCard schedule={activeSchedule} />
          ) : (
            <div className="bg-muted/30 flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
              <CalendarRange className="text-muted-foreground mb-4 h-12 w-12 opacity-20" />
              <h3 className="text-lg font-medium">Nenhum horário fixo definido</h3>
              <p className="text-muted-foreground text-sm">
                Entre em contato com a gerência para definir sua escala padrão.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
