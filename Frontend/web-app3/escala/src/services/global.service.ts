import { API_ROUTES } from "@/constants";
import { httpGet } from "@/lib/http/request";
import { normalizeImageUrlStrapi } from "@/lib/utils";
import { GlobalInterface } from "@/interfaces/global/global.interface";

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
      favicon: {
        id: data.favicon?.id,
        url: normalizeImageUrlStrapi(data.favicon?.url),
        alternativeText: data.favicon?.alternativeText || null,
      },
      defaultSeo: {
        id: data.defaultSeo?.id,
        metaTitle: data.defaultSeo?.metaTitle || "",
        metaDescription: data.defaultSeo?.metaDescription || "",
      },
    };
  } catch (error) {
    console.error("Erro ao buscar informações globais:", error);
    return null;
  }
}
