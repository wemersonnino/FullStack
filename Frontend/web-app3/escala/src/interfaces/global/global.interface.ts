export interface GlobalSEO {
  id?: number;
  metaTitle: string;
  metaDescription: string;
  shareImage?: GlobalMedia;
}

export interface GlobalMedia {
  id?: number;
  url: string;
  alternativeText?: string | null;
  mime?: string | null;
}

export type GlobalFavicon = GlobalMedia;
export type GlobalLogo = GlobalMedia;

export interface GlobalInterface {
  id: number;
  siteName: string;
  siteDescription: string;
  favicon?: GlobalFavicon;
  logo?: GlobalLogo;
  defaultSeo?: GlobalSEO;
}
