import { normalizeStrapiUrl } from "@/lib/utils";
import { Banner } from "@/interfaces/banner/banner.interface";

export function mapBanner(item: any): Banner {
  return {
    id: item.id,
    title: item.title,
    description: item.description || "",
    image: {
      url: normalizeStrapiUrl(item.image?.url),
      alternativeText: item.image?.alternativeText || "Banner padrão",
    },
  };
}

export function mapBanners(data: any[]): Banner[] {
  return data.map(mapBanner);
}
