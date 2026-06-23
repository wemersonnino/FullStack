'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Briefcase, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { createProject } from '@/services/organization.service';

export default function NovoProjetoPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error('Informe o nome do projeto.');
      return;
    }

    setIsSubmitting(true);
    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        active,
      });

      if (!project) {
        toast.error('Nao foi possivel cadastrar o projeto.');
        return;
      }

      toast.success('Projeto cadastrado com sucesso.');
      router.push('/dashboard/escala/admin');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Button variant="ghost" asChild className="mb-6 gap-2">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </Button>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Briefcase className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">Projetos</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Cadastrar Projeto</h1>
          <p className="text-muted-foreground">
            Projetos cadastrados podem ser usados na definicao de escalas dos colaboradores.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="project-name">Nome do projeto</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Plataforma Escala"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Descricao</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Contexto, objetivo ou area responsavel"
              className="min-h-24 resize-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="project-active">Projeto ativo</Label>
              <p className="text-sm text-muted-foreground">Projetos inativos nao devem ser usados em novas escalas.</p>
            </div>
            <Switch id="project-active" checked={active} onCheckedChange={setActive} />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" asChild>
              <Link href="/dashboard/escala/admin">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting} className="gap-2">
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar projeto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
