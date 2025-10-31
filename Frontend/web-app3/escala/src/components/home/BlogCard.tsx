import { Article } from '@/interfaces/article/article.interface';
import Image from 'next/image';
import Link from 'next/link';

export const BlogCard = ({ article }: { article: Article }) => {
  return (
    <article className="overflow-hidden rounded-lg border bg-white transition-all hover:shadow-md">
      {article.cover_image.url && (
        <Image
          src={article.cover_image.url}
          alt={article.cover_image.alternativeText || article.title}
          width={400}
          height={220}
          className="h-48 w-full object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="mb-2 text-xl font-bold">{article.title}</h2>
        <p className="mb-4 text-gray-600">{article.description}</p>
        <Link href={`/artigo/${article.slug}`} className="text-blue-500 hover:underline">
          Ler mais
        </Link>
      </div>
    </article>
  );
};
