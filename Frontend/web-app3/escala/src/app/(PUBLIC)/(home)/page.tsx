import { BlogList } from '@/components/home/BlogList';
import { getBanners } from '@/services/banner.service';
import { getArticles } from '@/services/article.service';
import { BannerCarousel } from '@/components/shared/BannerCarousel';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const [banners, articles] = await Promise.all([getBanners(), getArticles(6)]);
  const bannersWithImages = banners.filter((banner) => banner.image?.url);

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative isolate bg-gray-900 px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>
        <div className="mx-auto max-w-2xl py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-white sm:text-7xl">
              Gestão de Escalas Simplificada
            </h1>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
              Organize turnos, gerencie equipes e otimize a produtividade da sua empresa com a plataforma Escala.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild>
                <Link href="/login">Começar agora</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                <Link href="#saiba-mais">
                  Saiba mais <span aria-hidden="true">→</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div id="saiba-mais" className="py-12">
        {bannersWithImages.length > 0 && <BannerCarousel banners={bannersWithImages} interval={5000} />}
        <div className="container mx-auto mt-12 px-6">
          <BlogList articles={articles} />
        </div>
      </div>
    </div>
  );
}
