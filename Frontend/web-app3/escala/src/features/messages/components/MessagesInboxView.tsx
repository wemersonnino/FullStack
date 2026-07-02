'use client';

import Link from 'next/link';
import { useDeferredValue, useMemo, useState } from 'react';
import { Bell, CheckCircle2, Clock3, MailOpen, Search, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageDetailsModal } from '@/components/dashboard/MessageDetailsModal';
import { MessageModel } from '@/infrastructure/adapters/message.adapter';

type MessageStatusFilter = 'ALL' | MessageModel['status'];

type MessagesInboxViewProps = {
  pending: MessageModel[];
  approved: MessageModel[];
  rejected: MessageModel[];
  read: MessageModel[];
};

function sortMessages(messages: MessageModel[]) {
  return [...messages].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

function statusLabel(status: MessageModel['status']) {
  switch (status) {
    case 'PENDING':
      return 'Pendente';
    case 'APPROVED':
      return 'Aprovada';
    case 'REJECTED':
      return 'Rejeitada';
    case 'READ':
      return 'Lida';
    default:
      return status;
  }
}

function typeLabel(type: MessageModel['type']) {
  switch (type) {
    case 'PERMISSION_REQUEST':
      return 'Solicitação de permissão';
    case 'SHIFT_SWAP':
      return 'Troca de turno';
    case 'MESSAGE':
      return 'Mensagem';
    case 'CHAT':
      return 'Chat';
    default:
      return type;
  }
}

function statusVariant(status: MessageModel['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PENDING':
      return 'secondary';
    case 'APPROVED':
      return 'default';
    case 'REJECTED':
      return 'destructive';
    case 'READ':
      return 'outline';
    default:
      return 'outline';
  }
}

export function MessagesInboxView({ pending, approved, rejected, read }: MessagesInboxViewProps) {
  const [query, setQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<MessageModel | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const sections = useMemo(
    () => ({
      ALL: sortMessages([...pending, ...approved, ...rejected, ...read]),
      PENDING: sortMessages(pending),
      APPROVED: sortMessages(approved),
      REJECTED: sortMessages(rejected),
      READ: sortMessages(read),
    }),
    [approved, pending, read, rejected]
  );

  function filterMessages(status: MessageStatusFilter) {
    return sections[status].filter((message) => {
      if (!deferredQuery) return true;
      const target = [
        message.title,
        message.content,
        message.senderName,
        message.senderEmail,
        message.receiverName,
        message.receiverEmail,
        message.type,
        message.status,
      ]
        .join(' ')
        .toLowerCase();
      return target.includes(deferredQuery);
    });
  }

  const summary = [
    {
      label: 'Pendentes',
      value: pending.length,
      note: 'Exigem leitura ou decisão',
      icon: Clock3,
    },
    {
      label: 'Aprovadas',
      value: approved.length,
      note: 'Solicitações concluídas com aceite',
      icon: CheckCircle2,
    },
    {
      label: 'Rejeitadas',
      value: rejected.length,
      note: 'Fluxos encerrados com negativa',
      icon: XCircle,
    },
    {
      label: 'Caixa total',
      value: sections.ALL.length,
      note: 'Histórico combinado desta central',
      icon: Bell,
    },
  ];

  function openMessage(message: MessageModel) {
    setSelectedMessage(message);
    setModalOpen(true);
  }

  function renderList(status: MessageStatusFilter) {
    const messages = filterMessages(status);

    if (messages.length === 0) {
      return (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 text-center">
          <MailOpen className="mb-3 size-8 text-muted-foreground/60" />
          <p className="text-sm font-semibold">Nenhuma mensagem encontrada</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Ajuste os filtros ou aguarde novas solicitações operacionais chegarem nesta central.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-3">
        {messages.map((message) => (
          <button
            key={message.id}
            type="button"
            onClick={() => openMessage(message)}
            className="rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{typeLabel(message.type)}</Badge>
                  <Badge variant={statusVariant(message.status)}>{statusLabel(message.status)}</Badge>
                </div>
                <div>
                  <p className="truncate text-base font-semibold">{message.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{message.content}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground lg:min-w-56 lg:text-right">
                <p>
                  <span className="font-medium text-foreground">De:</span>{' '}
                  {message.senderName || message.senderEmail || 'Sistema'}
                </p>
                <p>
                  <span className="font-medium text-foreground">Para:</span>{' '}
                  {message.receiverName || message.receiverEmail || 'Você'}
                </p>
                <p>{new Date(message.createdAt).toLocaleString('pt-BR')}</p>
                {message.decidedAt && <p>Decisão em {new Date(message.decidedAt).toLocaleString('pt-BR')}</p>}
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      <section className="space-y-6">
        <div className="rounded-3xl border bg-gradient-to-br from-amber-50 via-background to-sky-50 p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-slate-900 text-white hover:bg-slate-900">Mensageria operacional</Badge>
            <span className="text-sm text-muted-foreground">Inbox unificado para solicitações e notificações</span>
          </div>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Central de mensagens do gestor</h1>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                Consolide pedidos de troca, permissões e mensagens operacionais em uma única fila com contexto,
                status e histórico recente.
              </p>
            </div>
            <Card className="rounded-2xl border-border/70 bg-background/80">
              <CardHeader>
                <CardTitle className="text-base">Uso recomendado</CardTitle>
                <CardDescription>
                  Decisões rápidas continuam no sino do header. Esta tela é a visão completa para operação e auditoria.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href="/dashboard">Voltar ao dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summary.map((item) => (
            <Card key={item.label} className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>{item.label}</CardDescription>
                <CardTitle className="flex items-center justify-between text-3xl">
                  {item.value}
                  <item.icon className="size-5 text-primary" />
                </CardTitle>
                <p className="text-xs text-muted-foreground">{item.note}</p>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="ALL" className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <TabsList className="h-auto flex-wrap justify-start rounded-2xl bg-muted/60 p-1">
              <TabsTrigger value="ALL">Tudo</TabsTrigger>
              <TabsTrigger value="PENDING">Pendentes</TabsTrigger>
              <TabsTrigger value="APPROVED">Aprovadas</TabsTrigger>
              <TabsTrigger value="REJECTED">Rejeitadas</TabsTrigger>
              <TabsTrigger value="READ">Lidas</TabsTrigger>
            </TabsList>
            <div className="relative w-full lg:w-96">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por título, conteúdo, remetente ou destinatário"
                className="pl-9"
              />
            </div>
          </div>

          <TabsContent value="ALL">{renderList('ALL')}</TabsContent>
          <TabsContent value="PENDING">{renderList('PENDING')}</TabsContent>
          <TabsContent value="APPROVED">{renderList('APPROVED')}</TabsContent>
          <TabsContent value="REJECTED">{renderList('REJECTED')}</TabsContent>
          <TabsContent value="READ">{renderList('READ')}</TabsContent>
        </Tabs>
      </section>

      <MessageDetailsModal
        message={selectedMessage}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onDecisionSuccess={() => window.location.reload()}
      />
    </>
  );
}
