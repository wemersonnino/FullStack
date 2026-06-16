import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { LeadCaptureForm } from '@/components/shared/LeadCaptureForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DemoPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { locale } = await params;

  return (
    <main className="bg-background">
      <section className="border-b bg-muted/25 py-16">
        <div className="container mx-auto px-6">
          <Button variant="ghost" className="mb-8 px-0" asChild>
            <Link href={`/${locale}`}>
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Voltar para a home
            </Link>
          </Button>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-4 rounded-md">
                Demo comercial
              </Badge>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                Mostre sua operação e receba uma demo orientada por contexto.
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Esta página existe para transformar interesse em conversa qualificada, já com
                consentimento, campanha e origem do lead preservados no backend.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border bg-background p-4">
                  <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h2 className="mt-3 font-bold">Conversa guiada</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Entra contexto comercial sem expor token ou URL interna.
                  </p>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h2 className="mt-3 font-bold">Dados com consentimento</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    O fluxo registra opt-in e metadados de campanha para o time comercial.
                  </p>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h2 className="mt-3 font-bold">Resposta mais rápida</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Leads entram em uma esteira pronta para retorno da equipe.
                  </p>
                </div>
              </div>

              <Button className="mt-6" asChild>
                <Link href={`/${locale}/#demo`}>
                  Voltar ao formulário
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <LeadCaptureForm
              title="Solicite a demo"
              description="Deixe seus dados e a equipe comercial retorna com uma apresentação objetiva."
              eyebrow="Contato comercial"
              ctaLabel="Solicitar demo"
              landingPageSlug="demo"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
