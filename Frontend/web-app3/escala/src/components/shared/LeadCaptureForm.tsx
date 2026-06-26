'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, MailWarning, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { toast } from 'sonner';
import { API_ROUTES } from '@/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LeadCaptureSchema, LeadCaptureSchemaType } from '@/lib/schemas/lead.schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { LeadCaptureResponse } from '@/types/campaign';

type LeadCaptureFormProps = {
  title: string;
  description: string;
  eyebrow?: string;
  ctaLabel?: string;
  landingPageSlug: string;
  campaignSlug?: string;
  className?: string;
};

const employeeRanges = [
  { value: '1-10', label: '1 a 10' },
  { value: '11-50', label: '11 a 50' },
  { value: '51-100', label: '51 a 100' },
  { value: '101-200', label: '101 a 200' },
  { value: '201-500', label: '201 a 500' },
  { value: '501+', label: '501+' },
];

const companySegments = [
  { value: 'igrejas', label: 'Igrejas e voluntariado' },
  { value: 'restaurantes', label: 'Restaurantes e bares' },
  { value: 'varejo', label: 'Varejo' },
  { value: 'clinicas-saude', label: 'Clínicas e saúde' },
  { value: 'seguranca', label: 'Segurança patrimonial' },
  { value: 'facilities', label: 'Facilities e limpeza' },
  { value: 'logistica', label: 'Logística e distribuição' },
  { value: 'tecnologia-suporte', label: 'Tecnologia e suporte' },
  { value: 'operacao-24x7', label: 'Operação 24/7' },
  { value: 'outros', label: 'Outro segmento' },
];

const planLabels: Record<string, string> = {
  essencial: 'Essencial',
  profissional: 'Profissional',
  'operacao-critica': 'Operação Crítica',
};

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  const local = digits.startsWith('55') ? digits.slice(2) : digits;

  if (local.length <= 2) return local;
  if (local.length <= 6) return `(${local.slice(0, 2)}) ${local.slice(2)}`;
  if (local.length <= 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7, 11)}`;
}

export function LeadCaptureForm({
  title,
  description,
  eyebrow = 'Demo',
  ctaLabel = 'Receber contato',
  landingPageSlug,
  campaignSlug,
  className,
}: LeadCaptureFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<LeadCaptureResponse | null>(null);

  const form = useForm<LeadCaptureSchemaType>({
    resolver: zodResolver(LeadCaptureSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      companyName: '',
      employeeRange: '',
      companySegment: '',
      marketingConsentGranted: false,
    },
  });

  const onSubmit = async (values: LeadCaptureSchemaType) => {
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch(API_ROUTES.LEADS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          landingPageSlug,
          campaignSlug,
          consentVersion: 'marketing-consent-v1',
          source: 'LANDING_PAGE',
        }),
      });

      const data = (await response.json()) as Partial<LeadCaptureResponse> & { message?: string };

      if (!response.ok) {
        throw new Error(data.message || 'Nao foi possivel registrar o lead');
      }

      setResult(data as LeadCaptureResponse);
      form.reset({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        employeeRange: '',
        companySegment: '',
        marketingConsentGranted: false,
      });
      toast.success(data.message || 'Lead enviado com sucesso');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel registrar o lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={cn(
        'overflow-hidden rounded-lg border bg-background shadow-sm ring-1 ring-primary/5',
        className
      )}
    >
      <div className="border-b bg-[linear-gradient(135deg,hsl(var(--primary)/0.12),transparent_58%)] p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {eyebrow}
        </div>
        <h2 className="mt-3 text-2xl font-black tracking-tight">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
            Plano sugerido no envio
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            LGPD by design
          </Badge>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="lead-success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-md border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400"
            >
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Solicitação recebida
            </div>
            <p className="mt-2 leading-6">
              Vamos retornar com uma demo orientada ao seu segmento.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {result.recommendedPlan && (
                <div className="rounded-md border bg-background/80 p-3">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Plano inicial</span>
                  <p className="mt-1 font-bold text-foreground">
                    {planLabels[result.recommendedPlan] ?? result.recommendedPlan}
                  </p>
                </div>
              )}
              {result.recommendedTemplate && (
                <div className="rounded-md border bg-background/80 p-3">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Template sugerido</span>
                  <p className="mt-1 font-bold text-foreground">{result.recommendedTemplate}</p>
                </div>
              )}
            </div>
            {result.personalEmail && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300">
                <MailWarning className="h-3.5 w-3.5" aria-hidden="true" />
                Email pessoal sinalizado para qualificação comercial.
              </div>
            )}
            </motion.div>
          ) : (
            <Form {...form}>
            <motion.form
              key="lead-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="voce@empresa.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormDescription>Emails pessoais não bloqueiam, mas entram como lead a qualificar.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Celular</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(31) 99999-8888"
                        autoComplete="tel"
                        inputMode="tel"
                        {...field}
                        onChange={(event) => field.onChange(formatPhone(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da empresa" autoComplete="organization" {...field} />
                    </FormControl>
                    <FormDescription>Opcional, mas ajuda a contextualizar a demo.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="employeeRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colaboradores</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employeeRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companySegment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segmento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companySegments.map((segment) => (
                            <SelectItem key={segment.value} value={segment.value}>
                              {segment.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="marketingConsentGranted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        Autorizo o uso dos meus dados para contato comercial
                      </FormLabel>
                      <FormDescription>
                        Usamos os dados somente para retorno da demo, sem compartilhar com terceiros.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="h-11 w-full" disabled={isSubmitting} isLoading={isSubmitting}>
                {isSubmitting ? 'Enviando...' : ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </motion.form>
            </Form>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-3 border-t px-6 py-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Consentimento versionado
        </span>
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          UTM e referrer preservados
        </span>
      </div>
    </motion.div>
  );
}
