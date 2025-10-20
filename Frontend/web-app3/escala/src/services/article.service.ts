import { Article } from "@/interfaces/article/article.interface";
import { normalizeImageUrlStrapi } from "@/lib/utils";

export async function getArticles(limit = 6): Promise<Article[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API}/api/articles?populate=*&pagination[limit]=${limit}`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];

    const json = await res.json();
    return json.data?.map((item: any) => ({
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
        "Conteúdo ainda não disponível para este artigo.",
    }));
  } catch (error) {
    console.error("Erro ao buscar artigos:", error);
    return [];
  }
}
