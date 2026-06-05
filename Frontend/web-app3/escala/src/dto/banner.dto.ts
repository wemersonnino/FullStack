import { normalizeStrapiUrl } from "@/lib/utils";
import { Banner } from "@/interfaces/banner/banner.interface";

export function mapBanner(item: any): Banner {
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle || "",
    description: item.description || "",
    slug: item.slug || "",
    image: {
      url: normalizeStrapiUrl(item.image?.url),
      alternativeText: item.image?.alternativeText || "Banner padrão",
    },
    button_text: item.button_text || "Saiba mais",
    button_link: item.button_link || "#",
  };
}

export function mapBanners(data: any[]): Banner[] {
  return data.map(mapBanner);
}
