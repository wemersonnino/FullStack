import { cookies } from "next/headers";
import { CampaignAttribution } from "@/types/campaign";

export async function getMarketingAttribution(): Promise<CampaignAttribution | null> {
  const cookieStore = await cookies();
  const cookieName = process.env.CAMPAIGN_COOKIE_NAME || "escala_marketing_attribution";
  const attributionCookie = cookieStore.get(cookieName);

  if (attributionCookie && attributionCookie.value) {
    try {
      return JSON.parse(attributionCookie.value) as CampaignAttribution;
    } catch (e) {
      console.error("Failed to parse marketing attribution cookie", e);
      return null;
    }
  }

  return null;
}

export async function clearMarketingAttribution() {
  const cookieStore = await cookies();
  const cookieName = process.env.CAMPAIGN_COOKIE_NAME || "escala_marketing_attribution";
  cookieStore.delete(cookieName);
}
