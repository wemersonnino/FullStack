'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { API_ROUTES } from '@/constants';
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
  const [submitted, setSubmitted] = React.useState(false);

  const form = useForm<LeadCaptureSchemaType>({
    resolver: zodResolver(LeadCaptureSchema),
    defaultValues: {
      name: '',
      email: '',
      companyName: '',
      marketingConsentGranted: false,
    },
  });

  const onSubmit = async (values: LeadCaptureSchemaType) => {
    setIsSubmitting(true);
    setSubmitted(false);

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
          source: 'LANDING_PAGE',
        }),
      });

      const data = (await response.json()) as Partial<LeadCaptureResponse> & { message?: string };

      if (!response.ok) {
        throw new Error(data.message || 'Nao foi possivel registrar o lead');
      }

      setSubmitted(true);
      form.reset({
        name: '',
        email: '',
        companyName: '',
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
    <div className={cn('rounded-lg border bg-background p-6 shadow-sm', className)}>
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        {eyebrow}
      </div>
      <h2 className="mt-3 text-2xl font-black tracking-tight">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>

      <div className="mt-6">
        {submitted ? (
          <div className="rounded-md border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Solicitação recebida
            </div>
            <p className="mt-2 leading-6">
              Vamos usar esse contato para responder com próximos passos da demo.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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

              <Button type="submit" className="w-full" disabled={isSubmitting} isLoading={isSubmitting}>
                {isSubmitting ? 'Enviando...' : ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          </Form>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Consentimento registrado
        </span>
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          BFF server-side
        </span>
      </div>
    </div>
  );
}
