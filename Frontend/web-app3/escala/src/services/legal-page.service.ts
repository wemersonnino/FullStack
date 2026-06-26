import { API_ROUTES } from '@/constants';
import { httpGet } from '@/lib/http/request';

export interface LegalPageContent {
  id: number | string;
  title: string;
  slug: string;
  content: string;
}

type StrapiResponse<T> = {
  data?: T[];
};

function mapLegalPage(item: any): LegalPageContent {
  const attrs = item.attributes ?? item;
  return {
    id: item.documentId ?? item.id,
    title: attrs.title || 'Documento legal',
    slug: attrs.slug || '',
    content: attrs.content || '',
  };
}

export async function getLegalPage(slug: string): Promise<LegalPageContent | null> {
  try {
    const response = await httpGet<StrapiResponse<any>>(
      `${API_ROUTES.LEGAL_PAGES}&filters[slug][$eq]=${encodeURIComponent(slug)}`
    );

    const item = response?.data?.[0];
    return item ? mapLegalPage(item) : null;
  } catch (error) {
    console.error('Erro ao buscar pagina legal do Strapi:', error);
    return null;
  }
}
