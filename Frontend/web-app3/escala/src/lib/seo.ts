// src/lib/seo.ts
import { getGlobal } from "@/services/global.service";
import { normalizeStrapiUrl } from "@/lib/utils";

interface MetaOptions {
  title?: string;
  description?: string;
  image?: string;
}

/**
 * Cria metadados dinâmicos mesclando dados locais e globais.
 */
export async function createMetadata(options: MetaOptions = {}) {
  const global = await getGlobal();

  const title = options.title
    ? `${options.title} | ${global?.siteName ?? ""}`
    : global?.defaultSeo?.metaTitle || "Escala Web App";

  const description =
    options.description ||
    global?.defaultSeo?.metaDescription ||
    global?.siteDescription ||
    "";

  const favicon = global?.favicon?.url
    ? normalizeStrapiUrl(global.favicon.url)
    : "/favicon.ico";

  const image = options.image || favicon || "/default-banner.svg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      siteName: global?.siteName,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    icons: { icon: favicon },
  };
}
