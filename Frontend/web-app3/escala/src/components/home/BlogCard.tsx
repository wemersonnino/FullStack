import { Article } from "@/interfaces/article/article.interface";
import Image from "next/image";

export const BlogCard = ({ article }: { article: Article }) => {
  return (
    <article
      className="bg-white border rounded-lg overflow-hidden
    hover:shadow-md transition-all"
    >
      {article.cover_image.url && (
        <Image
          src={article.cover_image.url}
          alt={article.cover_image.alternativeText || article.title}
          width={400}
          height={220}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">{article.title}</h2>
        <p className="text-gray-600 mb-4">{article.description}</p>
        <a
          href={`/blog/${article.slug}`}
          className="text-blue-500 hover:underline"
        >
          Ler mais
        </a>
      </div>
    </article>
  );
};
