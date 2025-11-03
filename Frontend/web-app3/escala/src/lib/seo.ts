// src/lib/seo.ts
import { getGlobal } from "@/services/global.service";

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
    : global?.defaultSeo.metaTitle || "Escala Web App";

  const description =
    options.description ||
    global?.defaultSeo.metaDescription ||
    global?.siteDescription ||
    "";

  const image =
    options.image || global?.favicon?.url || "/default-banner.jpg";

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
    icons: { icon: global?.favicon?.url },
  };
}
