import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Clock,
  MapPin,
  Megaphone,
  MessageSquareQuote,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Users,
} from 'lucide-react';
import { getArticles } from '@/services/article.service';
import { getLandingPage, getTestimonials } from '@/services/landing.service';
import { getBanners } from '@/services/banner.service';
import { getLatestAnnouncement } from '@/services/announcement.service';
import { BlogList } from '@/components/home/BlogList';
import { LeadCaptureForm } from '@/components/shared/LeadCaptureForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LandingFeature, LandingIconKey, LandingInfoCard } from '@/interfaces/landing/landing.interface';
import { PricingTable } from '@/components/dashboard/PricingTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

function InfoCardIcon({ card }: { card: LandingInfoCard }) {
  const Icon = iconMap[card.iconKey] ?? ShieldCheck;
  return <Icon className="h-5 w-5 text-primary" aria-hidden="true" />;
}

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const [landing, articles, testimonials, banners, announcement] = await Promise.all([
    getLandingPage({ locale }), 
    getArticles(3, locale),
    getTestimonials(locale),
    getBanners(),
    getLatestAnnouncement(),
  ]);
  
  const heroBgUrl = landing.heroBackgroundImage?.url || '/default-banner.svg';
  const sectionBgUrl = landing.sectionBackgroundImage?.url;
  const primaryBanner = banners[0];

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

      {announcement && (
        <section className="border-b bg-primary/5">
          <div className="container mx-auto flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Megaphone className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold">{announcement.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{announcement.content}</p>
              </div>
            </div>
            <Badge variant="outline" className="w-fit rounded-md capitalize">{announcement.category}</Badge>
          </div>
        </section>
      )}

      <section id="demo" className="border-b bg-muted/25 py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-4 rounded-md">{landing.demoEyebrow}</Badge>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                {landing.demoTitle}
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                {landing.demoDescription}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {landing.demoCards.map((card) => (
                  <div key={card.id} className="rounded-lg border bg-background p-4">
                    <InfoCardIcon card={card} />
                    <h3 className="mt-3 font-bold">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
                  </div>
                ))}
              </div>

              <Button variant="link" className="mt-6 w-fit px-0 font-bold" asChild>
                <Link href={landing.demoLinkUrl}>
                  {landing.demoLinkLabel}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <LeadCaptureForm
              title={landing.demoFormTitle}
              description={landing.demoFormDescription}
              landingPageSlug="home"
            />
          </div>
        </div>
      </section>

      {primaryBanner?.image?.url && (
        <section className="border-b py-16">
          <div className="container mx-auto px-6">
            <div className="grid overflow-hidden rounded-lg border bg-card lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-[260px]">
                <Image
                  src={primaryBanner.image.url}
                  alt={primaryBanner.image.alternativeText || primaryBanner.title}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-10">
                <Badge variant="outline" className="mb-4 w-fit rounded-md">Campanha ativa</Badge>
                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{primaryBanner.title}</h2>
                {primaryBanner.description && (
                  <p className="mt-4 text-base leading-7 text-muted-foreground">{primaryBanner.description}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

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
            <Badge variant="outline" className="mb-4 rounded-md">{landing.featuresEyebrow}</Badge>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{landing.featuresTitle}</h2>
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
            <Badge variant="outline" className="mb-4 rounded-md">{landing.industriesEyebrow}</Badge>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{landing.industriesTitle}</h2>
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

      <section id="depoimentos" className="border-b py-20">
        <div className="container mx-auto px-6">
          <div className="mb-10 max-w-3xl">
            <Badge variant="outline" className="mb-4 rounded-md">Prova operacional</Badge>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Histórias de saída da planilha para escala auditável.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Cases iniciais anonimizados ajudam a validar a promessa central do produto sem exagerar maturidade regulatória.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.id} className="rounded-lg border bg-card p-5 shadow-sm">
                <MessageSquareQuote className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="mt-5 text-lg font-bold">{testimonial.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{testimonial.content}</p>
                <div className="mt-5 border-t pt-4">
                  <p className="font-semibold">{testimonial.authorName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{testimonial.authorRole}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b py-20">
        <div className="container mx-auto px-6">
          <div className="mb-10 max-w-2xl">
            <Badge variant="outline" className="mb-4 rounded-md">{landing.pricingEyebrow}</Badge>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{landing.pricingTitle}</h2>
          </div>

          <PricingTable plans={landing.pricingPlans} isPublic={true} />
        </div>
      </section>

      <section id="faq" className="border-b bg-muted/25 py-20">
        <div className="container mx-auto px-6">
          <div className="mb-10 max-w-2xl">
            <Badge variant="outline" className="mb-4 rounded-md">{landing.faqEyebrow}</Badge>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{landing.faqTitle}</h2>
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
              <Badge variant="outline" className="mb-4 rounded-md">{landing.blogEyebrow}</Badge>
              <h2 className="text-3xl font-black tracking-tight">{landing.blogTitle}</h2>
              <p className="mt-2 text-muted-foreground">{landing.blogDescription}</p>
            </div>
            <Button variant="link" className="w-fit px-0 font-bold" asChild>
              <Link href={landing.blogLinkUrl}>
                {landing.blogLinkLabel}
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
