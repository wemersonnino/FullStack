import { Article } from '@/interfaces/article/article.interface';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export const BlogCard = ({ article }: { article: Article }) => {
  const publishedAt = article.published_at
    ? new Date(article.published_at).toLocaleDateString('pt-BR')
    : null;

  return (
    <article className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      {article.cover_image.url && (
        <Image
          src={article.cover_image.url}
          alt={article.cover_image.alternativeText || article.title}
          width={400}
          height={220}
          className="h-48 w-full object-cover"
        />
      )}
      <div className="flex min-h-56 flex-col p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {article.category?.name && (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
              {article.category.name}
            </span>
          )}
          {publishedAt && <span>{publishedAt}</span>}
        </div>
        <h2 className="mb-2 text-xl font-bold text-foreground">{article.title}</h2>
        <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{article.description}</p>
        <Button asChild variant="outline" className="mt-auto w-fit">
          <Link href={`/artigo/${article.slug}`}>Ler mais</Link>
        </Button>
      </div>
    </article>
  );
};
