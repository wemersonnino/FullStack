import { API_ROUTES } from "@/constants";
import { FooterInterface } from "@/interfaces/footer/footer.interface";
import { normalizeImageUrlStrapi } from "@/lib/utils";

export async function getFooter(): Promise<FooterInterface | null> {
  const response = await fetch(API_ROUTES.FOOTER, { cache: "no-store" });
  if (!response.ok) return null;

  const json = await response.json();
  const data = json.data;

  if (!data) return null;

  return {
    id: data.id,
    logo: {
      url: normalizeImageUrlStrapi(data.logo?.url),
      alternativeText: data.logo?.alternativeText || "Logo padrão",
    },
    description: data.description,
    links: data.links || [],
    social_links: data.socialLinks || [],
    copyright: data.copyright,
  };
}
