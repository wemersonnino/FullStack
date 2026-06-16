import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Users,
} from 'lucide-react';
import { getArticles } from '@/services/article.service';
import { getLandingPage } from '@/services/landing.service';
import { BlogList } from '@/components/home/BlogList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LandingFeature, LandingIconKey } from '@/interfaces/landing/landing.interface';
import { cn } from '@/lib/utils';

const iconMap = {
  calendar: CalendarDays,
  clock: Clock,
  'map-pin': MapPin,
  'bar-chart': BarChart3,
  shield: ShieldCheck,
  sparkles: Sparkles,
  users: Users,
  shuffle: Shuffle,
} satisfies Record<LandingIconKey, typeof CalendarDays>;

function FeatureIcon({ feature }: { feature: LandingFeature }) {
  const Icon = iconMap[feature.iconKey] ?? CalendarDays;
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background text-primary">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </div>
  );
}

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const [landing, articles] = await Promise.all([
    getLandingPage(locale), 
    getArticles(3, locale)
  ]);
  
  const heroBgUrl = landing.heroBackgroundImage?.url || '/default-banner.svg';
  const sectionBgUrl = landing.sectionBackgroundImage?.url;

  return (
    <div className="flex flex-col bg-background">
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden border-b bg-slate-950 text-white">
        <Image
          src={heroBgUrl}
          alt={landing.heroTitle}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-slate-950/70" />

        <div className="container relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] flex-col justify-center px-6 py-24">
          <div className="max-w-4xl">
            {landing.eyebrow && (
              <Badge className="mb-6 rounded-md border-white/15 bg-white/10 text-white hover:bg-white/10">
                {landing.eyebrow}
              </Badge>
            )}

            <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              {landing.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              {landing.heroDescription}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={landing.primaryCtaUrl}>
                  {landing.primaryCtaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/10" asChild>
                <Link href={landing.secondaryCtaUrl}>{landing.secondaryCtaLabel}</Link>
              </Button>
            </div>
          </div>

          <div className="mt-14 grid gap-3 text-sm text-slate-200 md:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <Clock className="mb-3 h-5 w-5 text-primary" aria-hidden="true" />
              {landing.trialDescription}
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <Sparkles className="mb-3 h-5 w-5 text-primary" aria-hidden="true" />
              {landing.aiTrialDescription}
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <ShieldCheck className="mb-3 h-5 w-5 text-primary" aria-hidden="true" />
              {landing.securityStatement}
            </div>
          </div>
        </div>
      </section>

      <section id="modulos" className="border-b py-20 relative">
        {sectionBgUrl && (
          <Image
            src={sectionBgUrl}
            alt="Fundo decorativo"
            fill
            className="absolute inset-0 object-cover opacity-5 pointer-events-none"
          />
        )}
        <div className="container relative z-10 mx-auto px-6">
          <div className="mb-10 max-w-2xl">
            <Badge variant="outline" className="mb-4 rounded-md">Modulos</Badge>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Operacao, regras e auditoria no mesmo fluxo.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {landing.features.map((feature) => (
              <article key={feature.id} className="rounded-lg border bg-card p-5">
                <FeatureIcon feature={feature} />
                <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="setores" className="border-b bg-muted/25 py-20">
        <div className="container mx-auto px-6">
          <div className="mb-10 max-w-2xl">
            <Badge variant="outline" className="mb-4 rounded-md">Setores</Badge>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Preparado para operacoes com ritmos diferentes.</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {landing.industries.map((industry) => (
              <article key={industry.id} className="rounded-lg border bg-background p-5">
                {industry.highlightMetric && (
                  <p className="mb-4 text-sm font-semibold text-primary">{industry.highlightMetric}</p>
                )}
                <h3 className="text-xl font-bold">{industry.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{industry.valueProposition}</p>
                {industry.description && <p className="mt-3 text-sm leading-6 text-muted-foreground">{industry.description}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b py-20">
        <div className="container mx-auto px-6">
          <div className="mb-10 max-w-2xl">
            <Badge variant="outline" className="mb-4 rounded-md">Planos</Badge>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Teste comercial com controle de custo da IA.</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {landing.pricingPlans.map((plan) => (
              <article
                key={plan.id}
                className={cn(
                  'rounded-lg border bg-card p-6',
                  plan.recommended && 'border-primary shadow-sm'
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-black">{plan.name}</h3>
                    {plan.description && <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>}
                  </div>
                  {plan.recommended && <Badge className="rounded-md">Recomendado</Badge>}
                </div>

                <div className="mt-6 flex flex-wrap items-end gap-3">
                  <span className="text-4xl font-black">{plan.priceLabel}</span>
                  <span className="pb-1 text-sm text-muted-foreground">{plan.trialDescription}</span>
                </div>
                <p className="mt-3 text-sm font-medium text-primary">{plan.aiLimitDescription}</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button className="mt-8" asChild>
                  <Link href={plan.ctaUrl}>{plan.ctaLabel}</Link>
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-b bg-muted/25 py-20">
        <div className="container mx-auto px-6">
          <div className="mb-10 max-w-2xl">
            <Badge variant="outline" className="mb-4 rounded-md">FAQ</Badge>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Perguntas frequentes.</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {landing.faqs.map((faq) => (
              <article key={faq.id} className="rounded-lg border bg-background p-5">
                <h3 className="font-bold">{faq.question}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="blog" className="py-20">
        <div className="container mx-auto px-6">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="outline" className="mb-4 rounded-md">Conteudo</Badge>
              <h2 className="text-3xl font-black tracking-tight">Conteudo para gestores.</h2>
              <p className="mt-2 text-muted-foreground">Artigos editoriais continuam vindo do Strapi.</p>
            </div>
            <Button variant="link" className="w-fit px-0 font-bold" asChild>
              <Link href="/artigos">
                Ver artigos
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <BlogList articles={articles} />
        </div>
      </section>
    </div>
  );
}
