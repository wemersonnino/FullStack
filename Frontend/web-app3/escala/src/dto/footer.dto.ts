import { normalizeStrapiUrl } from "@/lib/utils";
import { FooterInterface } from "@/interfaces/footer/footer.interface";

export function mapFooter(item: any): FooterInterface {
  const logoUrl = normalizeStrapiUrl(item.logo?.url);

  return {
    id: item.id,
    logo: logoUrl
      ? {
          url: logoUrl,
          alternativeText: item.logo?.alternativeText || "Logo padrão",
        }
      : undefined,
    description: item.description,
    links: item.links || [],
    social_links: item.socialLinks || [],
    copyright: item.copyright,
  };
}
