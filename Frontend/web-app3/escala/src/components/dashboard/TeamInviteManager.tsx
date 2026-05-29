'use client';

import { useState, useEffect } from 'react';
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
  XCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const InviteSchema = z.object({
  email: z.string().email('Email inválido'),
  roleName: z.enum(['MANAGER', 'USER', 'OWNER'], {
    message: 'Selecione um cargo',
  }),
});

type InviteSchemaType = z.infer<typeof InviteSchema>;

export function TeamInviteManager() {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const form = useForm<InviteSchemaType>({
    resolver: zodResolver(InviteSchema),
    defaultValues: {
      email: '',
      roleName: 'USER',
    },
  });

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bff/team/invitations');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      toast.error('Erro ao carregar convites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const onInvite = async (data: InviteSchemaType) => {
    setSending(true);
    try {
      const response = await fetch('/api/bff/team/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Convite enviado com sucesso!');
        form.reset();
        fetchInvitations();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao enviar convite.');
      }
    } catch (error) {
      toast.error('Erro ao processar convite.');
    } finally {
      setSending(true);
    }
  };

  const onCancel = async (id: string) => {
    try {
      const response = await fetch(`/api/bff/team/invitations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Convite cancelado.');
        fetchInvitations();
      }
    } catch (error) {
      toast.error('Erro ao cancelar convite.');
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <UserPlus className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Convidar para a Equipe</h2>
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
                      <Input placeholder="email@exemplo.com" className="pl-9" {...field} />
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
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cargo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USER">Funcionário (Visualização)</SelectItem>
                      <SelectItem value="MANAGER">Gerente (Gestão de Escalas)</SelectItem>
                      <SelectItem value="OWNER">Admin / Proprietário</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? 'Enviando...' : 'Enviar Convite'}
              <Plus className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Convites Enviados</h2>
          <Button variant="ghost" size="sm" onClick={fetchInvitations}>
            Atualizar
          </Button>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground animate-pulse">Carregando convites...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed text-center">
            <Clock className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Nenhum convite pendente no momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div key={inv.id} className="group flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className={`rounded-full p-2 ${inv.acceptedAt ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {inv.acceptedAt ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{inv.email}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{inv.roleName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  {!inv.acceptedAt && (
                    <>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => copyLink(inv.token)} title="Copiar link de convite">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onCancel(inv.id)} title="Cancelar convite">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {inv.acceptedAt && (
                     <span className="text-xs font-medium text-emerald-600">Aceito</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
