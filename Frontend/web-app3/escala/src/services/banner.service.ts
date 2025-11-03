import { API_ROUTES } from "@/constants";
import { httpGet } from "@/lib/http/request";
import { normalizeImageUrlStrapi } from "@/lib/utils";
import { Banner } from "@/interfaces/banner/banner.interface";

/**
 * Busca todos os banners disponíveis no Strapi.
 * Utiliza httpGet centralizado (Axios) e normaliza as URLs de imagem.
 */
export async function getBanners(): Promise<Banner[]> {
  try {
    const json = await httpGet<{ data: any[] }>(API_ROUTES.BANNERS);
    if (!json?.data) return [];

    return json.data.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle || "",
      description: item.description || "",
      slug: item.slug || "",
      image: {
        url: normalizeImageUrlStrapi(item.image?.url),
        alternativeText: item.image?.alternativeText || "Banner padrão",
      },
      button_text: item.button_text || "Saiba mais",
      button_link: item.button_link || "#",
    }));
  } catch (error) {
    console.error("Erro ao buscar banners:", error);
    return [];
  }
}
