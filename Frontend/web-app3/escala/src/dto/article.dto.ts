import { normalizeImageUrlStrapi } from "@/lib/utils";
import { Article } from "@/interfaces/article/article.interface";

export function mapArticle(item: any): Article {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    slug: item.slug,
    published_at: item.publishedAt,
    cover_image: {
      url: normalizeImageUrlStrapi(item.cover?.url),
      alternativeText: item.cover?.alternativeText || "Capa do artigo",
    },
    author: item.author
      ? {
          id: item.author.id,
          name: item.author.name,
          avatar: item.author.avatar
            ? {
                url: normalizeImageUrlStrapi(item.author.avatar.url),
                alternativeText: item.author.avatar.alternativeText || "",
              }
            : undefined,
        }
      : undefined,
    category: item.category
      ? {
          id: item.category.id,
          name: item.category.name,
          slug: item.category.slug,
        }
      : undefined,
    content:
      item.blocks?.[0]?.body ||
      item.content ||
      "Conteúdo ainda não disponível para este artigo.",
  };
}

export function mapArticles(data: any[]): Article[] {
  return data.map(mapArticle);
}
