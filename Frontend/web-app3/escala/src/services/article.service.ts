import { baseUrl } from '@/constants';
import { httpGet } from '@/lib/http/request';
import { Article } from '@/interfaces/article/article.interface';
import { StrapiResponse } from '@/interfaces/strapi/strapi-response.interface';
import { mapArticle, mapArticles } from '@/dto';

const ARTICLE_POPULATE =
  'populate[cover]=true' +
  '&populate[author][populate][avatar]=true' +
  '&populate[category]=true' +
  '&populate[blocks][populate]=*';

export async function getArticles(limit = 6, locale?: string): Promise<Article[]> {
  try {
    const localeFilter = locale ? `&locale=${locale}` : '';
    const url = `${baseUrl}/api/articles?${ARTICLE_POPULATE}&pagination[limit]=${limit}${localeFilter}`;
    const json = await httpGet<StrapiResponse<Article>>(url);
    if (!json?.data) return [];

    return mapArticles(json.data);
  } catch (error) {
    console.error('Erro ao buscar artigos:', error);
    return [];
  }
}

export async function getArticleBySlug(slug: string, locale?: string): Promise<Article | null> {
  try {
    const localeFilter = locale ? `&locale=${locale}` : '';
    const url = `${baseUrl}/api/articles?${ARTICLE_POPULATE}&filters[slug][$eq]=${slug}${localeFilter}`;
    const json = await httpGet<{ data: any[] }>(url);
    const data = json?.data?.[0];
    if (!data) return null;
    return mapArticle(data);
  } catch (error) {
    console.error('Erro ao buscar artigo:', error);
    return null;
  }
}
