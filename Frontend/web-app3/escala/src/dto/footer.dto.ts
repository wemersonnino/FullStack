import { normalizeStrapiUrl } from "@/lib/utils";
import { FooterInterface } from "@/interfaces/footer/footer.interface";

export function mapFooter(item: any): FooterInterface {
  return {
    id: item.id,
    logo: {
      url: normalizeStrapiUrl(item.logo?.url),
      alternativeText: item.logo?.alternativeText || "Logo padrão",
    },
    description: item.description,
    links: item.links || [],
    social_links: item.socialLinks || [],
    copyright: item.copyright,
  };
}
