'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, GraduationCap, Plus, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  LearningProgress,
  completeLearningProgress,
  createLearningProgress,
} from '@/services/learning-progress.service';

type LearningProgressPanelProps = {
  initialItems: LearningProgress[];
};

export function LearningProgressPanel({ initialItems }: LearningProgressPanelProps) {
  const [items, setItems] = useState(initialItems);
  const [module, setModule] = useState('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [completingId, setCompletingId] = useState<number | null>(null);

  const completedCount = items.filter((item) => item.completed).length;

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!module.trim() || !topic.trim()) {
      toast.error('Informe módulo e tópico.');
      return;
    }

    setSaving(true);
    try {
      const created = await createLearningProgress({
        module: module.trim(),
        topic: topic.trim(),
        notes: notes.trim() || undefined,
        completed: false,
      });

      if (created) {
        setItems((current) => [created, ...current]);
        setModule('');
        setTopic('');
        setNotes('');
        toast.success('Progresso registrado.');
      }
    } catch (error) {
      toast.error('Não foi possível registrar o progresso.');
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete(item: LearningProgress) {
    if (item.completed) return;

    setCompletingId(item.id);
    try {
      await completeLearningProgress(item.id);
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? { ...currentItem, completed: true } : currentItem
        )
      );
      toast.success('Tópico marcado como concluído.');
    } catch (error) {
      toast.error('Não foi possível concluir o tópico.');
    } finally {
      setCompletingId(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
      <section className="rounded-lg border bg-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Registrar aprendizado</h2>
            <p className="text-sm text-muted-foreground">Acompanhe módulos operacionais concluídos.</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleCreate}>
          <Input value={module} onChange={(event) => setModule(event.target.value)} placeholder="Módulo" />
          <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Tópico" />
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Observações"
            className="min-h-24 resize-none"
          />
          <Button type="submit" className="w-full gap-2" isLoading={saving}>
            <Plus className="h-4 w-4" />
            Registrar
          </Button>
        </form>
      </section>

      <section className="rounded-lg border bg-card p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Progresso</h2>
            <p className="text-sm text-muted-foreground">{completedCount} de {items.length} tópicos concluídos.</p>
          </div>
          <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-600">
            <Trophy className="h-5 w-5" />
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-md border border-dashed text-center">
            <GraduationCap className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Nenhum progresso registrado</p>
            <p className="text-xs text-muted-foreground">Registre o primeiro módulo para acompanhar evolução.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-md border p-4">
                <Checkbox
                  checked={item.completed}
                  disabled={item.completed || completingId === item.id}
                  onCheckedChange={() => handleComplete(item)}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{item.topic}</p>
                    {item.completed && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.module}</p>
                  {item.notes && <p className="mt-2 text-sm text-muted-foreground">{item.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
