import { normalizeStrapiUrl } from '@/lib/utils';
import { Article, ArticleBlock, ArticleMedia } from '@/interfaces/article/article.interface';

function mapMedia(file: any): ArticleMedia | undefined {
  if (!file) return undefined;

  return {
    id: file.id,
    url: normalizeStrapiUrl(file.url),
    alternativeText: file.alternativeText || file.name || '',
    caption: file.caption || '',
    name: file.name || '',
    mime: file.mime || '',
    ext: file.ext || '',
    width: file.width,
    height: file.height,
  };
}

function mapArticleBlock(block: any): ArticleBlock {
  switch (block.__component) {
    case 'shared.rich-text':
      return {
        id: block.id,
        __component: block.__component,
        body: block.body || '',
      };
    case 'shared.media':
      return {
        id: block.id,
        __component: block.__component,
        file: mapMedia(block.file),
      };
    case 'shared.slider':
      return {
        id: block.id,
        __component: block.__component,
        files: Array.isArray(block.files) ? block.files.map(mapMedia).filter(Boolean) : [],
      };
    case 'shared.quote':
      return {
        id: block.id,
        __component: block.__component,
        title: block.title || '',
        body: block.body || '',
      };
    default:
      return block;
  }
}

/**
 * Adapta a estrutura retornada pela API Strapi para o modelo Article
 */
export function mapArticle(item: any): Article {
  const blocks = Array.isArray(item.blocks) ? item.blocks.map(mapArticleBlock) : [];

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    slug: item.slug,
    published_at: item.publishedAt,
    cover_image: {
      url: normalizeStrapiUrl(item.cover?.url),
      alternativeText: item.cover?.alternativeText || 'Capa do artigo',
    },
    author: item.author
      ? {
          id: item.author.id,
          name: item.author.name,
          avatar: item.author.avatar
            ? {
                url: normalizeStrapiUrl(item.author.avatar.url),
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
    content: item.blocks
      ? item.blocks
          .filter((block: any) => block.__component === 'shared.rich-text')
          .map((block: any) => block.body)
          .join('\n\n')
      : 'Conteúdo ainda não disponível para este artigo.',
    blocks,
  };
}

export function mapArticles(data: any[]): Article[] {
  return data.map(mapArticle);
}

export const fallbackArticles: Article[] = [
  {
    id: 1,
    title: 'Como reduzir 30% das horas extras com escalas inteligentes',
    slug: 'reduzir-horas-extras-escalas',
    description: 'Dicas práticas para otimizar sua jornada de trabalho usando dados.',
    published_at: '2026-06-17T10:00:00.000Z',
    cover_image: {
      url: '/uploads/coffee-art.jpg',
      alternativeText: 'Como reduzir 30% das horas extras com escalas inteligentes',
    },
    content: 'Dicas práticas para otimizar sua jornada de trabalho usando dados.',
    blocks: [],
  },
  {
    id: 2,
    title: 'Geofencing: A prova de presença definitiva no B2B',
    slug: 'geofencing-prova-presenca',
    description: 'Por que hospitais e empresas de segurança estão abandonando o ponto físico.',
    published_at: '2026-06-17T11:00:00.000Z',
    cover_image: {
      url: '/uploads/what-s-inside-a-black-hole.jpg',
      alternativeText: 'Geofencing: A prova de presença definitiva no B2B',
    },
    content: 'Por que hospitais e empresas de segurança estão abandonando o ponto físico.',
    blocks: [],
  },
];
