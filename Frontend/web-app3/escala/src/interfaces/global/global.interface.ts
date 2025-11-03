export interface GlobalSEO {
  id: number;
  metaTitle: string;
  metaDescription: string;
}

export interface GlobalFavicon {
  id: number;
  url: string;
  alternativeText?: string | null;
}

export interface GlobalInterface {
  id: number;
  siteName: string;
  siteDescription: string;
  favicon: GlobalFavicon;
  defaultSeo: GlobalSEO;
}
