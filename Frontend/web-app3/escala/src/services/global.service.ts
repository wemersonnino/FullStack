import { API_ROUTES } from "@/constants";
import { httpGet } from "@/lib/http/request";
import { normalizeStrapiUrl } from "@/lib/utils";
import { GlobalInterface } from "@/interfaces/global/global.interface";

function mapMedia(media: any) {
  const file = media?.data ?? media;
  if (!file?.url) return undefined;

  return {
    id: file.id,
    url: normalizeStrapiUrl(file.url),
    alternativeText: file.alternativeText || null,
    mime: file.mime || null,
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

    // Atributos podem estar na raiz (v5) ou em .attributes (v4/v5 wrapper)
    const attrs = data.attributes ?? data;

    return {
      id: data.id,
      siteName: attrs.siteName || "Escala SaaS",
      siteDescription: attrs.siteDescription || "",
      favicon: mapMedia(attrs.favicon),
      logo: mapMedia(attrs.logo),
      defaultSeo: attrs.defaultSeo
        ? {
            id: attrs.defaultSeo.id,
            metaTitle: attrs.defaultSeo.metaTitle || "",
            metaDescription: attrs.defaultSeo.metaDescription || "",
            shareImage: mapMedia(attrs.defaultSeo.shareImage),
          }
        : undefined,
    };
  } catch (error) {
    console.error("Erro ao buscar informações globais:", error);
    return null;
  }
}
