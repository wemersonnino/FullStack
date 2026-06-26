import { API_ROUTES } from '@/constants';
import { Announcement } from '@/interfaces/announcement/announcement.interface';
import { httpGet } from '@/lib/http/request';
import { normalizeStrapiUrl } from '@/lib/utils';

type StrapiResponse<T> = {
  data?: T[];
};

function mapAnnouncement(item: any): Announcement {
  const attrs = item.attributes ?? item;
  const image = attrs.image?.data ?? attrs.image;

  return {
    id: item.id,
    title: attrs.title || '',
    slug: attrs.slug || '',
    content: attrs.content || '',
    image: image?.url ? normalizeStrapiUrl(image.url) : undefined,
    category: attrs.category || 'update',
    publishedAt: attrs.publishedAt || attrs.updatedAt || attrs.createdAt || '',
  };
}

export async function getLatestAnnouncement(): Promise<Announcement | null> {
  try {
    const response = await httpGet<StrapiResponse<any>>(
      `${API_ROUTES.ANNOUNCEMENTS}&pagination[pageSize]=1&sort=updatedAt:desc`
    );

    const item = response?.data?.[0];
    return item ? mapAnnouncement(item) : null;
  } catch (error) {
    console.error('Erro ao buscar comunicado do Strapi:', error);
    return null;
  }
}
