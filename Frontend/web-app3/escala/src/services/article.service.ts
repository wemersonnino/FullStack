import { API_ROUTES } from '@/constants';
import { httpGet } from '@/lib/http/request';
import { Article } from '@/interfaces/article/article.interface';
import { StrapiResponse } from '@/interfaces/strapi/strapi-response.interface';
import { mapArticle, mapArticles } from '@/dto/article.dto';

export async function getArticles(limit = 6): Promise<Article[]> {
  try {
    const url = `${API_ROUTES.ARTICLES}&pagination[limit]=${limit}`;
    const json = await httpGet<StrapiResponse<Article>>(url);
    if (!json?.data) return [];

    return mapArticles(json.data);
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
