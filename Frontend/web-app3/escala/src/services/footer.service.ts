import { API_ROUTES } from "@/constants";
import { httpGet } from "@/lib/http/request";
import { FooterInterface } from "@/interfaces/footer/footer.interface";
import { normalizeImageUrlStrapi } from "@/lib/utils";

export async function getFooter(): Promise<FooterInterface | null> {
  const json = await httpGet<{ data: any }>(API_ROUTES.FOOTER);
  const data = json?.data;
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
