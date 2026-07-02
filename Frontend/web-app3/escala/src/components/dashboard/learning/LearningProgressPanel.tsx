'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Compass,
  GraduationCap,
  Plus,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LearningProgress,
  completeLearningProgress,
  createLearningProgress,
} from '@/services/learning-progress.service';

type LearningProgressPanelProps = {
  initialItems: LearningProgress[];
  isManagerOrAdmin: boolean;
};

type ModuleGroup = {
  module: string;
  items: LearningProgress[];
  completedCount: number;
};

function buildModuleGroups(items: LearningProgress[]): ModuleGroup[] {
  const groups = new Map<string, LearningProgress[]>();

  for (const item of items) {
    const key = item.module?.trim() || 'Geral';
    const current = groups.get(key) ?? [];
    current.push(item);
    groups.set(key, current);
  }

  return Array.from(groups.entries())
    .map(([module, groupedItems]) => ({
      module,
      items: groupedItems,
      completedCount: groupedItems.filter((item) => item.completed).length,
    }))
    .sort((a, b) => a.module.localeCompare(b.module, 'pt-BR'));
}

export function LearningProgressPanel({
  initialItems,
  isManagerOrAdmin,
}: LearningProgressPanelProps) {
  const [items, setItems] = useState(initialItems);
  const [module, setModule] = useState('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const completedCount = items.filter((item) => item.completed).length;
  const pendingCount = items.length - completedCount;
  const completionRate = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;
  const moduleGroups = buildModuleGroups(items);

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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] text-white shadow-lg">
          <CardContent className="p-6">
            <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3 text-white">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100">Topicos</p>
            <p className="mt-2 text-3xl font-black tracking-tight">{items.length}</p>
            <p className="mt-2 text-sm text-blue-50">
              Itens que compoem sua jornada atual de aprendizado operacional.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-emerald-200 bg-emerald-50 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-600 p-3 text-white">
              <Trophy className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">Concluidos</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-emerald-950">{completedCount}</p>
            <p className="mt-2 text-sm text-emerald-800">{completionRate}% da trilha concluida ate agora.</p>
          </CardContent>
        </Card>

        <Card className="border border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 inline-flex rounded-2xl bg-amber-500 p-3 text-white">
              <Compass className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">Proximos Passos</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-amber-950">{pendingCount}</p>
            <p className="mt-2 text-sm text-amber-800">
              Topicos ainda pendentes para consolidar sua capacitacao.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className={`grid gap-6 ${isManagerOrAdmin ? 'xl:grid-cols-[1.35fr_0.8fr]' : 'xl:grid-cols-1'}`}>
        <section className="space-y-6">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight">Trilhas e modulos</CardTitle>
                  <CardDescription>
                    {isManagerOrAdmin
                      ? 'A API atual serve o progresso pessoal do usuario autenticado. Nesta tela isso vira uma visao de trilha, nao apenas uma lista solta de registros.'
                      : 'Para funcionario, a tela deve priorizar consumo: entender modulos, topicos e o que falta concluir.'}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  {moduleGroups.length} modulos
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 text-center">
                  <Sparkles className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-base font-semibold">Nenhuma trilha atribuida ainda</p>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                    A API ainda nao entrega um catalogo institucional de cursos. Enquanto isso, a melhor experiencia
                    para o colaborador e mostrar que nao existem modulos publicados para sua conta, em vez de abrir um
                    formulario vazio como ponto de partida.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {moduleGroups.map((group) => (
                    <div key={group.module} className="rounded-2xl border bg-card p-5 shadow-sm">
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-bold tracking-tight">{group.module}</p>
                          <p className="text-sm text-muted-foreground">
                            {group.completedCount} de {group.items.length} topicos concluidos neste modulo.
                          </p>
                        </div>
                        <Badge
                          variant={group.completedCount === group.items.length ? 'default' : 'secondary'}
                          className="rounded-full px-3 py-1"
                        >
                          {group.completedCount === group.items.length ? 'Modulo concluido' : 'Em progresso'}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {group.items.map((item) => (
                          <div key={item.id} className="flex items-start gap-3 rounded-xl border p-4">
                            <Checkbox
                              checked={item.completed}
                              disabled={item.completed || completingId === item.id}
                              onCheckedChange={() => handleComplete(item)}
                              className="mt-1"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-semibold">{item.topic}</p>
                                {item.completed && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {item.completed
                                  ? 'Concluido e registrado no seu historico.'
                                  : 'Marque como concluido quando terminar este topico.'}
                              </p>
                              {item.notes && <p className="mt-2 text-sm text-muted-foreground">{item.notes}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {!isManagerOrAdmin && items.length > 0 && (
            <Card className="border border-blue-200 bg-blue-50 shadow-sm">
              <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-blue-950">Leitura de produto para o perfil funcionario</p>
                  <p className="text-sm text-blue-800">
                    O foco aqui e acompanhar trilhas atribuidas e concluir topicos. Cadastro manual deixa de ser o
                    centro da experiencia para evitar ruido e ambiguidade.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-900">
                  Proximo passo
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {isManagerOrAdmin && (
          <aside className="space-y-6">
            <Card className="border border-border/60 shadow-sm">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Registro manual</CardTitle>
                    <CardDescription>
                      Use apenas para treinamentos internos, evidencias e topicos ainda nao estruturados em trilha.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreate}>
                  <Input
                    value={module}
                    onChange={(event) => setModule(event.target.value)}
                    placeholder="Modulo ou frente de capacitacao"
                  />
                  <Input
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    placeholder="Topico, curso ou evidencia"
                  />
                  <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Observacoes, contexto ou criterio de conclusao"
                    className="min-h-24 resize-none"
                  />
                  <Button type="submit" className="w-full gap-2" isLoading={saving}>
                    <Plus className="h-4 w-4" />
                    Registrar item
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-slate-50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">O que a API serve hoje</CardTitle>
                <CardDescription>
                  O backend atual entrega apenas progresso pessoal do usuario autenticado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <p>Leitura disponivel: listar progresso pessoal por modulo e topico.</p>
                <p>Escrita disponivel: criar item manual e marcar item como concluido.</p>
                <p>
                  Lacuna de produto: ainda nao existe catalogo institucional, trilha atribuida por perfil nem visao de
                  equipe para gestor.
                </p>
              </CardContent>
            </Card>
          </aside>
        )}
      </div>
    </div>
  );
}
