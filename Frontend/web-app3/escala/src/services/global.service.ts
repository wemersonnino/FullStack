import { API_ROUTES } from "@/constants";
import { httpGet } from "@/lib/http/request";
import { normalizeStrapiUrl } from "@/lib/utils";
import { GlobalInterface } from "@/interfaces/global/global.interface";

function mapMedia(media: any) {
  if (!media?.url) return undefined;

  return {
    id: media.id,
    url: normalizeStrapiUrl(media.url),
    alternativeText: media.alternativeText || null,
    mime: media.mime || null,
  };
}

/**
 * Busca as informações globais do site (nome, favicon, SEO).
 */
export async function getGlobal(): Promise<GlobalInterface | null> {
  try {
    const json = await httpGet<{ data: any }>(API_ROUTES.GLOBAL);
    const data = json?.data;
    if (!data) return null;

    return {
      id: data.id,
      siteName: data.siteName,
      siteDescription: data.siteDescription,
      favicon: mapMedia(data.favicon),
      logo: mapMedia(data.logo),
      defaultSeo: data.defaultSeo
        ? {
            id: data.defaultSeo.id,
            metaTitle: data.defaultSeo.metaTitle || "",
            metaDescription: data.defaultSeo.metaDescription || "",
            shareImage: mapMedia(data.defaultSeo.shareImage),
          }
        : undefined,
    };
  } catch (error) {
    console.error("Erro ao buscar informações globais:", error);
    return null;
  }
}
