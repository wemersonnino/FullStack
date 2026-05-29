import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  BarChart3, 
  MapPin, 
  Users, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { getArticles } from '@/services/article.service';
import { BlogList } from '@/components/home/BlogList';

export default async function HomePage() {
  const articles = await getArticles(3);

  return (
    <div className="flex flex-col">
      {/* 🚀 Hero Section - Marketing Focus */}
      <section className="relative overflow-hidden bg-slate-950 pt-32 pb-24 lg:pt-48 lg:pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />
          <div className="absolute top-0 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="container relative z-10 mx-auto px-6 text-center">
          <div className="mx-auto mb-6 flex max-w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary-foreground/80">Lançamento: Módulo de Ponto por Geolocalização</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-balance text-5xl font-black tracking-tight text-white md:text-7xl">
            Reduza o absenteísmo em <span className="text-primary">30%</span> com Gestão Inteligente.
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg font-medium text-slate-400 sm:text-xl/8">
            A plataforma definitiva para clínicas, hospitais e varejo. Automatize escalas complexas, aprove trocas em segundos e exporte sua folha de pagamento com um clique.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 rounded-full px-10 text-lg font-bold shadow-xl shadow-primary/25 transition-transform hover:scale-105" asChild>
              <Link href="/register">Começar Teste Grátis de 90 Dias</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 rounded-full px-10 text-lg font-bold text-white border-white/20 hover:bg-white/5" asChild>
              <Link href="#features">Ver Demonstração</Link>
            </Button>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> LGPD Compliant</div>
            <div className="flex items-center gap-2"><Clock className="h-5 w-5" /> Suporte 24/7</div>
            <div className="flex items-center gap-2"><Users className="h-5 w-5" /> +500 Empresas</div>
          </div>
        </div>
      </section>

      {/* 🎯 Features Section - Service Selling */}
      <section id="features" className="bg-background py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-4">Funcionalidades</h2>
            <p className="text-4xl font-black tracking-tight sm:text-5xl">Tudo o que sua operação precisa.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Escalas em Segundos',
                desc: 'Gerador automático baseado em carga horária e descansos obrigatórios.',
                icon: Zap,
                color: 'text-amber-500',
                bg: 'bg-amber-500/10'
              },
              {
                title: 'Geolocalização (Geofencing)',
                desc: 'Bata o ponto pelo app com validação de raio GPS e IP corporativo.',
                icon: MapPin,
                color: 'text-blue-500',
                bg: 'bg-blue-500/10'
              },
              {
                title: 'Exportação Contábil',
                desc: 'Relatórios de folha prontos para sistemas como TOTVS, SAP e Senior.',
                icon: BarChart3,
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/10'
              }
            ].map((f, i) => (
              <div key={i} className="group rounded-3xl border bg-card p-8 transition-all hover:shadow-2xl hover:shadow-primary/5">
                <div className={cn(f.bg, "mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:-rotate-6")}>
                  <f.icon className={cn(f.color, "h-8 w-8")} />
                </div>
                <h3 className="mb-4 text-2xl font-bold">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 💰 Pricing Section - Conversion Focus */}
      <section id="pricing" className="bg-slate-50 py-24 dark:bg-slate-900/50">
        <div className="container mx-auto px-6 text-center">
            <div className="mx-auto max-w-3xl rounded-[3rem] border bg-card p-12 shadow-2xl">
                <h2 className="text-3xl font-black">Plano Multi-Tenant Completo</h2>
                <div className="my-8 flex items-center justify-center gap-2">
                    <span className="text-5xl font-black">R$ 0</span>
                    <span className="text-muted-foreground font-bold italic">nos primeiros 3 meses</span>
                </div>
                <div className="grid gap-4 text-left sm:grid-cols-2">
                    {[
                      'Usuários Ilimitados',
                      'Multi-Empresa / Filiais',
                      'Ponto por Geolocalização',
                      'Exportação de Folha CSV/PDF',
                      'IA de Sugestão de Escalas',
                      'API para Integração ERP'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                </div>
                <Button size="lg" className="mt-12 h-14 w-full rounded-full text-lg font-bold" asChild>
                    <Link href="/register">Começar Trial Estendido</Link>
                </Button>
                <p className="mt-4 text-xs text-muted-foreground">Sem cartão de crédito. Cancelamento a qualquer momento.</p>
            </div>
        </div>
      </section>

      {/* 📰 Blog Section */}
      <section id="blog" className="py-24">
        <div className="container mx-auto px-6">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Conteúdo para Gestores</h2>
              <p className="text-muted-foreground">Dicas para otimizar sua escala e reduzir turnover.</p>
            </div>
            <Button variant="link" className="group text-primary font-bold" asChild>
              <Link href="/blog">
                Ver todos os artigos <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          <BlogList articles={articles} />
        </div>
      </section>

      {/* 🏁 Footer - Final CTA */}
      <footer className="bg-slate-950 py-20 text-white">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="mb-6 flex items-center gap-2">
                <ClipboardList className="h-8 w-8 text-primary" />
                <span className="text-2xl font-black tracking-tighter">ESCALASaaS</span>
              </div>
              <p className="max-w-md text-slate-400">
                Ajudamos empresas a recuperarem o controle sobre seu tempo e recursos humanos através de tecnologia e inovação.
              </p>
            </div>
            <div>
              <h4 className="mb-6 font-bold uppercase tracking-widest text-primary text-xs">Produto</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><Link href="#features">Funcionalidades</Link></li>
                <li><Link href="#pricing">Preços</Link></li>
                <li><Link href="/login">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-6 font-bold uppercase tracking-widest text-primary text-xs">Suporte</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><Link href="/docs">Documentação</Link></li>
                <li><Link href="/contato">Falar com Consultor</Link></li>
                <li><Link href="/termos">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-20 border-t border-white/10 pt-10 text-center text-sm text-slate-500">
            © 2026 EscalaSaaS. Desenvolvido com foco em alta performance e escalabilidade.
          </div>
        </div>
      </footer>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
