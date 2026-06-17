'use client';

import { CalendarPlus, LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CriarEscalaPayload, Escala, SessionLikeUser, UsuarioEscala } from '@/core/domain/escala/escala.types';
import { atualizarEscala, criarEscala } from '@/core/adapters/escala.service';
import { groupEscalasByDay, toDateKey } from '../hooks/useEscalaCalendar';
import { EscalaEmployeeCard } from './EscalaEmployeeCard';
import { EscalaMiniCalendar } from './EscalaMiniCalendar';
import { EscalaUpcomingList } from './EscalaUpcomingList';
import { EscalaUserEditModal } from './EscalaUserEditModal';
import { EscalaUserTable } from './EscalaUserTable';
import { EscalaShiftGrid } from './EscalaShiftGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { endOfMonth, startOfMonth } from 'date-fns';

type Props = {
  user: SessionLikeUser;
  initialEscalas: Escala[];
  usuarios: UsuarioEscala[];
};

export function EscalaDashboardAdmin({ initialEscalas, usuarios }: Props) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [escalas, setEscalas] = useState(initialEscalas);
  const [selectedDay, setSelectedDay] = useState(toDateKey(new Date()));
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioEscala | null>(null);
  const [editingEscala, setEditingEscala] = useState<Escala | null>(null);
  
  const cursor = new Date();
  const start = startOfMonth(cursor);
  const end = endOfMonth(cursor);
  const escalasByDay = groupEscalasByDay(escalas);

  function openCreate(usuario?: UsuarioEscala) {
    setSelectedUsuario(usuario ?? null);
    setEditingEscala(null);
    setModalOpen(true);
  }

  function viewDetails(usuario: UsuarioEscala) {
    setSelectedUsuario(usuario);
  }

  async function save(payload: CriarEscalaPayload, escalaId?: string) {
    try {
      if (escalaId) {
        const updated = await atualizarEscala({ ...payload, id: escalaId });
        if (updated) setEscalas((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await criarEscala(payload);
        setEscalas((current) => [...current, ...created]);
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Nao foi possivel salvar a escala');
    }
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Administracao</p>
          <h1 className="text-2xl font-semibold">Gestao de escalas</h1>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="hidden sm:block">
            <TabsList>
              <TabsTrigger value="grid" className="gap-2">
                <LayoutGrid className="size-4" /> Grade
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <List className="size-4" /> Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button type="button" onClick={() => openCreate()}>
            <CalendarPlus className="size-4" />
            Adicionar escala
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Proximas escalas</h2>
            <p className="text-sm text-muted-foreground">Funcionarios escalados nos proximos dias.</p>
          </div>
          <EscalaUpcomingList escalas={escalas} canManage onEdit={(escala) => {
            setEditingEscala(escala);
            setSelectedUsuario(null);
            setModalOpen(true);
          }} />
        </div>
        <EscalaMiniCalendar cursor={cursor} escalasByDay={escalasByDay} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
      </div>

      {usuarios[0] && <EscalaEmployeeCard usuario={usuarios[0]} />}

      {viewMode === 'grid' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Grade Mensal</h3>
          </div>
          <EscalaShiftGrid 
            usuarios={usuarios} 
            escalas={escalas} 
            startDate={start} 
            endDate={end} 
          />
        </div>
      ) : (
        <EscalaUserTable users={usuarios} onEditEscala={openCreate} onViewDetails={viewDetails} />
      )}

      <EscalaUserEditModal
        open={modalOpen}
        usuario={selectedUsuario}
        usuarios={usuarios}
        escala={editingEscala}
        onOpenChange={setModalOpen}
        onSave={save}
      />
    </section>
  );
}
