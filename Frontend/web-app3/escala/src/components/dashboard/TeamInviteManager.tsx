'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Plus, 
  Mail, 
  UserPlus, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Copy,
  ShieldCheck,
  Link2,
  KeyRound,
  RefreshCw,
  TimerReset,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TeamInvitation } from '@/core/domain/models/invitation.model';

const TEAM_INVITATIONS_URL = '/api/bff/team/invitations';

const InviteSchema = z.object({
  email: z.string().email('Email inválido'),
  roleName: z.enum(['MANAGER', 'USER', 'OWNER'], {
    message: 'Selecione um cargo',
  }),
});

type InviteSchemaType = z.infer<typeof InviteSchema>;

export function TeamInviteManager() {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [latestInvite, setLatestInvite] = useState<TeamInvitation | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const form = useForm<InviteSchemaType>({
    resolver: zodResolver(InviteSchema),
    defaultValues: {
      email: '',
      roleName: 'USER',
    },
  });

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(TEAM_INVITATIONS_URL);
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch {
      toast.error('Erro ao carregar convites.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => fetchInvitations());
  }, [fetchInvitations]);

  const onInvite = async (data: InviteSchemaType) => {
    setSending(true);
    try {
      const response = await fetch(TEAM_INVITATIONS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const created = (await response.json()) as TeamInvitation;
        setLatestInvite(created);
        toast.success('Convite enviado com sucesso!');
        form.reset();
        void fetchInvitations();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao enviar convite.');
      }
    } catch {
      toast.error('Erro ao processar convite.');
    } finally {
      setSending(false);
    }
  };

  const onCancel = async (id: string) => {
    try {
      const response = await fetch(`${TEAM_INVITATIONS_URL}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Convite cancelado.');
        fetchInvitations();
      }
    } catch {
      toast.error('Erro ao cancelar convite.');
    }
  };

  const copyLink = (inviteUrl?: string) => {
    if (!inviteUrl) {
      toast.error('Link do convite indisponível.');
      return;
    }
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Link copiado para a área de transferência!');
  };

  const formatStatus = (invitation: TeamInvitation) => {
    if (invitation.acceptedAt) {
      return { label: 'Aceito', tone: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' };
    }
    if (invitation.expired || !invitation.active) {
      return { label: 'Encerrado', tone: 'bg-zinc-500/10 text-zinc-700 border-zinc-500/20' };
    }
    return { label: 'Ativo', tone: 'bg-amber-500/10 text-amber-700 border-amber-500/20' };
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#f5f1e8_0%,#ffffff_40%,#eef4ff_100%)] shadow-sm">
        <div className="grid gap-6 p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <Badge className="rounded-full bg-slate-900 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white hover:bg-slate-900">
              Fluxo Seguro de Convites
            </Badge>
            <div className="space-y-3">
              <h2 className="max-w-xl text-3xl font-black tracking-tight text-slate-950">
                Convide colaboradores sem deixar link permanente exposto.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                O link do convite aparece apenas no momento da criação. Depois disso, a plataforma mantém apenas um
                identificador resumido do token para auditoria e suporte.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                <ShieldCheck className="mb-3 h-5 w-5 text-emerald-600" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Armazenamento</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Token hash no backend</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                <Link2 className="mb-3 h-5 w-5 text-blue-700" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Entrega</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Link visível uma única vez</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                <TimerReset className="mb-3 h-5 w-5 text-amber-600" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Validade</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Expiração automática</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-6 text-slate-50 shadow-xl shadow-slate-900/10">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-2">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Boas práticas</p>
                <h3 className="text-lg font-bold">Operação segura de onboarding</h3>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <p>1. Gere o convite e copie o link imediatamente.</p>
              <p>2. Envie o link por canal confiável para o colaborador certo.</p>
              <p>3. Se houver suspeita de exposição, cancele o convite e gere outro.</p>
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-slate-300">
              Depois da criação, a listagem exibe apenas a prévia do token e o status. Isso reduz risco de vazamento por
              tela compartilhada, print ou acesso administrativo indevido.
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[28px] border bg-card p-7 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Novo Convite</h2>
              <p className="text-sm text-muted-foreground">Defina o papel inicial e gere um link seguro de onboarding.</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onInvite)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email do Colaborador</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="email@empresa.com" className="h-12 rounded-2xl pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo / Permissão</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-2xl">
                          <SelectValue placeholder="Selecione um cargo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USER">Funcionário</SelectItem>
                        <SelectItem value="MANAGER">Gestor operacional</SelectItem>
                        <SelectItem value="OWNER">Owner / administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="h-12 w-full rounded-2xl" disabled={sending} isLoading={sending}>
                {sending ? 'Gerando convite...' : 'Gerar convite seguro'}
                <Plus className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </section>

        <section className="space-y-5">
          <div className="rounded-[28px] border bg-slate-950 p-7 text-slate-50 shadow-xl shadow-slate-900/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Entrega Imediata</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">Link de uso único</h2>
              </div>
              <Button variant="secondary" size="sm" onClick={fetchInvitations}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
            </div>

            {latestInvite?.inviteUrl ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Convite gerado agora</p>
                  <p className="mt-2 text-sm text-slate-200">
                    Envie este link apenas para <span className="font-semibold">{latestInvite.email}</span>. Ele não volta
                    a ser exibido na listagem administrativa.
                  </p>
                  <div className="mt-4 rounded-2xl bg-black/30 p-4 font-mono text-xs leading-6 text-slate-100 break-all">
                    {latestInvite.inviteUrl}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button className="rounded-2xl" onClick={() => copyLink(latestInvite.inviteUrl)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar link agora
                    </Button>
                    {latestInvite.tokenPreview ? (
                      <Badge variant="secondary" className="rounded-full border-white/10 bg-white/10 text-slate-100">
                        Token {latestInvite.tokenPreview}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-6 text-slate-300">
                Após gerar um convite, o link aparecerá aqui para cópia imediata. A listagem histórica manterá apenas a
                prévia do token, e não a URL completa.
              </div>
            )}
          </div>

          <div className="rounded-[28px] border bg-card p-7 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight">Convites emitidos</h2>
                <p className="text-sm text-muted-foreground">Auditoria operacional de convites ativos, aceitos e encerrados.</p>
              </div>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                {invitations.length} registros
              </Badge>
            </div>

            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <p className="animate-pulse text-sm text-muted-foreground">Carregando convites...</p>
              </div>
            ) : invitations.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed text-center">
                <Clock className="mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Nenhum convite emitido no momento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.map((inv) => {
                  const status = formatStatus(inv);
                  return (
                    <div
                      key={inv.id}
                      className="grid gap-4 rounded-2xl border p-4 transition-colors hover:bg-muted/30 md:grid-cols-[1fr_auto]"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-sm font-semibold">{inv.email}</p>
                          <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${status.tone}`}>
                            {status.label}
                          </span>
                          <Badge variant="outline" className="rounded-full">
                            {inv.roleName}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>Expira em {new Date(inv.expiresAt).toLocaleString('pt-BR')}</span>
                          {inv.tokenPreview ? <span>Prévia do token: {inv.tokenPreview}</span> : null}
                          {inv.acceptedAt ? <span>Aceito em {new Date(inv.acceptedAt).toLocaleString('pt-BR')}</span> : null}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        {!inv.acceptedAt && inv.active && !inv.expired ? (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-2xl text-destructive hover:bg-destructive/10"
                            onClick={() => onCancel(inv.id)}
                            title="Cancelar convite"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            {inv.acceptedAt ? 'Onboarding concluído' : 'Sem ação pendente'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
