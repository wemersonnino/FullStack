import { API_ROUTES } from '@/constants';
import { httpGet } from '@/lib/http/request';
import { normalizeImageUrlStrapi } from '@/lib/utils';
import { Article } from '@/interfaces/article/article.interface';

export async function getArticles(limit = 6): Promise<Article[]> {
  try {
    const url = `${API_ROUTES.ARTICLES}&pagination[limit]=${limit}`;
    const json = await httpGet<{ data: any[] }>(url);
    if (!json?.data) return [];

    return json.data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      slug: item.slug,
      published_at: item.publishedAt,
      cover_image: {
        url: normalizeImageUrlStrapi(item.cover?.url),
        alternativeText: item.cover?.alternativeText || 'Capa do artigo',
      },
      author: item.author
        ? {
            id: item.author.id,
            name: item.author.name,
            avatar: item.author.avatar
              ? {
                  url: normalizeImageUrlStrapi(item.author.avatar.url),
                  alternativeText: item.author.avatar.alternativeText || '',
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
      content: item.blocks?.[0]?.body || 'Conteúdo ainda não disponível para este artigo.',
    }));
  } catch (error) {
    console.error('Erro ao buscar artigos:', error);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const url = `${API_ROUTES.ARTICLES}&filters[slug][$eq]=${slug}`;
    const json = await httpGet<{ data: any[] }>(url);
    const data = json?.data?.[0];
    if (!data) return null;
    return mapArticle(data);
  } catch (error) {
    console.error('Erro ao buscar artigo:', error);
    return null;
  }
}

/**
 * Adapta a estrutura retornada pela API Strapi para o modelo Article
 */
function mapArticle(item: any): Article {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    slug: item.slug,
    published_at: item.publishedAt,
    cover_image: {
      url: normalizeImageUrlStrapi(item.cover?.url),
      alternativeText: item.cover?.alternativeText || 'Capa do artigo',
    },
    author: item.author
      ? {
          id: item.author.id,
          name: item.author.name,
          avatar: item.author.avatar
            ? {
                url: normalizeImageUrlStrapi(item.author.avatar.url),
                alternativeText: item.author.avatar.alternativeText || '',
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
    content: item.blocks?.[0]?.body || 'Conteúdo ainda não disponível para este artigo.',
  };
}
