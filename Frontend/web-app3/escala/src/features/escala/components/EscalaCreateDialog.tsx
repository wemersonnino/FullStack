'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { criarEscala } from '@/core/adapters/escala.service';
import { UsuarioEscala } from '@/core/domain/escala/escala.types';

type EscalaCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUsuarios?: UsuarioEscala[];
};

export function EscalaCreateDialog({ open, onOpenChange, initialUsuarios = [] }: EscalaCreateDialogProps) {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<UsuarioEscala[]>(initialUsuarios);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [dates, setDates] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [workMode, setWorkMode] = useState<'PRESENCIAL' | 'REMOTO'>('PRESENCIAL');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredUsuarios = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return usuarios;
    return usuarios.filter((usuario) =>
      [usuario.nome, usuario.email, usuario.setorNome, usuario.projetoNome, usuario.cargo]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [query, usuarios]);

  const parsedDates = useMemo(
    () => dates.split(/[\s,;]+/).map((date) => date.trim()).filter(Boolean),
    [dates]
  );

  function toggleUsuario(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  async function handleSubmit() {
    if (selectedIds.length === 0) {
      toast.error('Selecione ao menos um funcionario.');
      return;
    }
    if (parsedDates.length === 0) {
      toast.error('Informe ao menos uma data no formato AAAA-MM-DD.');
      return;
    }

    setSubmitting(true);
    try {
      for (const usuarioId of selectedIds) {
        const usuario = usuarios.find((item) => item.id === usuarioId);
        await criarEscala({
          usuarioId,
          empresaId: usuario?.empresaId ?? undefined,
          setorId: usuario?.setorId ?? undefined,
          projetoId: usuario?.projetoId ?? undefined,
          datas: parsedDates,
          horarioInicio: startTime,
          horarioFim: endTime,
          remoto: workMode === 'REMOTO',
          local: location || usuario?.projetoNome || usuario?.setorNome || undefined,
          observacao: notes || undefined,
        });
      }
      toast.success('Escala criada com sucesso.');
      setSelectedIds([]);
      setDates('');
      setNotes('');
      setLocation('');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel criar a escala.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            Nova Escala
          </DialogTitle>
          <DialogDescription>
            Crie escalas para um funcionario ou para um grupo selecionado.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>Funcionarios</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar por nome, email, setor, projeto ou cargo"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="max-h-56 overflow-y-auto rounded-md border">
              {filteredUsuarios.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">Nenhum funcionario encontrado.</p>
              ) : (
                filteredUsuarios.map((usuario) => (
                  <label
                    key={usuario.id}
                    className="flex cursor-pointer items-start gap-3 border-b p-3 last:border-b-0 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedIds.includes(usuario.id)}
                      onCheckedChange={() => toggleUsuario(usuario.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{usuario.nome}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {usuario.email}
                        {usuario.setorNome ? ` • ${usuario.setorNome}` : ''}
                        {usuario.projetoNome ? ` • ${usuario.projetoNome}` : ''}
                      </span>
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="shift-dates">Datas</Label>
              <Textarea
                id="shift-dates"
                value={dates}
                onChange={(event) => setDates(event.target.value)}
                placeholder="2026-07-01, 2026-07-02"
                className="min-h-20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="start-time">Inicio</Label>
              <Input id="start-time" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-time">Fim</Label>
              <Input id="end-time" type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Modalidade</Label>
              <Select value={workMode} onValueChange={(value) => setWorkMode(value as 'PRESENCIAL' | 'REMOTO')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                  <SelectItem value="REMOTO">Remoto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shift-location">Posto, setor, projeto ou local</Label>
              <Input
                id="shift-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="UTI, Recepcao, Projeto Alpha"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="shift-notes">Observacoes</Label>
            <Textarea id="shift-notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Criando...' : 'Criar escala'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
