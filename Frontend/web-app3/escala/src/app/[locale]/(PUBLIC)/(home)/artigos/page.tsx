import { BlogCard } from '@/components/home/BlogCard';
import { Button } from '@/components/ui/button';
import { getArticles } from '@/services/article.service';
import { Search, Newspaper } from 'lucide-react';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import Link from 'next/link';

interface ArticlesPageProps {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
  }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { q = '', categoria = '' } = await searchParams;
  const query = q.trim().toLowerCase();
  const selectedCategory = categoria.trim();
  const articles = await getArticles(100);

  const categories = Array.from(
    new Map(
      articles
        .filter((article) => article.category?.slug)
        .map((article) => [article.category!.slug, article.category!.name])
    )
  ).sort(([, firstName], [, secondName]) => firstName.localeCompare(secondName));

  const filteredArticles = articles.filter((article) => {
    const matchesQuery =
      !query ||
      article.title.toLowerCase().includes(query) ||
      (article.description ?? '').toLowerCase().includes(query) ||
      (article.category?.name ?? '').toLowerCase().includes(query);

    const matchesCategory = !selectedCategory || article.category?.slug === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  return (
    <section className="bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Artigos</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Conteúdos publicados para acompanhar novidades, comunicados e materiais editoriais.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Voltar para a home</Link>
          </Button>
        </div>

        <form className="mb-8 grid gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm md:grid-cols-[1fr_240px_auto]">
          <label className="relative block">
            <span className="sr-only">Buscar artigos</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar por título, descrição ou categoria"
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </label>

          <label>
            <span className="sr-only">Filtrar por categoria</span>
            <select
              name="categoria"
              defaultValue={selectedCategory}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="">Todas as categorias</option>
              {categories.map(([slug, name]) => (
                <option key={slug} value={slug}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 md:flex-none">
              Filtrar
            </Button>
            {(q || selectedCategory) && (
              <Button asChild variant="ghost">
                <Link href="/artigos">Limpar</Link>
              </Button>
            )}
          </div>
        </form>

        {articles.length === 0 ? (
          <EmptyArticlesMessage message="Não existem artigos publicados no momento." />
        ) : filteredArticles.length === 0 ? (
          <EmptyArticlesMessage message="Nenhum artigo encontrado com os filtros selecionados." />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyArticlesMessage({ message }: { message: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Newspaper />
        </EmptyMedia>
        <EmptyTitle>Nenhum conteúdo para exibir</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
