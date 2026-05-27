import { BlogList } from '@/components/home/BlogList';
import { getBanners } from '@/services/banner.service';
import { getArticles } from '@/services/article.service';
import { BannerCarousel } from '@/components/shared/BannerCarousel';
import Link from 'next/link';

export default async function HomePage() {
  const [banners, articles] = await Promise.all([getBanners(), getArticles(6)]);

  return (
    <div className="bg-gray-900">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
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
              <Link
                href="/login"
                className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Começar agora
              </Link>
              <Link href="#saiba-mais" className="text-sm/6 font-semibold text-white">
                Saiba mais <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Dynamic Content */}
      <div id="saiba-mais" className="py-12">
        {banners && banners.length > 0 ? (
          <BannerCarousel banners={banners} interval={5000} />
        ) : (
          <BannerCarousel banners={[]} />
        )}
        <div className="container mx-auto px-6 mt-12">
          <BlogList articles={articles} />
        </div>
      </div>
    </div>
  );
}
