import { getArticleBySlug } from '@/services/article.service';
import { normalizeImageUrlStrapi } from '@/lib/utils';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createMetadata } from '@/lib/seo';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 🧠 SEO dinâmico: usa dados do artigo + dados globais do site
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  return createMetadata({
    title: article?.title,
    description: article?.description,
    image: article?.cover_image?.url,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return notFound();

  const cover = article.cover_image?.url
    ? normalizeImageUrlStrapi(article.cover_image.url)
    : '/default-banner.jpg';

  const author = article.author?.name || 'Autor desconhecido';
  const publishedAt = new Date(article.published_at).toLocaleDateString('pt-BR');

  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      {/* Banner topo */}
      <div className="relative mb-8 h-96 w-full">
        <Image
          src={cover}
          alt={article.cover_image?.alternativeText || article.title}
          fill
          className="rounded-xl object-cover"
        />
      </div>

      <h1 className="mb-2 text-4xl font-bold">{article.title}</h1>
      <div className="mb-6 text-gray-500">
        <span>{author}</span> • <span>{publishedAt}</span>
      </div>

      <div
        className="prose prose-lg dark:prose-invert"
        dangerouslySetInnerHTML={{
          __html: article.content || '',
        }}
      />

      {article.category && (
        <p className="mt-8 text-sm text-gray-400">
          Categoria: <strong>{article.category.name}</strong>
        </p>
      )}
    </article>
  );
}
