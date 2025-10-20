import { API_ROUTES } from "@/constants";
import { Banner } from "@/interfaces/banner/banner.interface";
import { normalizeImageUrlStrapi } from "@/lib/utils";

export async function getBanner(): Promise<Banner[] | null> {
  try {
    const response = await fetch(API_ROUTES.BANNERS, { cache: "no-store" });
    if (!response.ok) return null;

    const json = await response.json();
    const banners = json.data?.map((item: any) => ({
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

    return banners || null;
  } catch (error) {
    console.error("Erro ao buscar banners:", error);
    return null;
  }
}
