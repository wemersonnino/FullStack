export interface FooterInterface {
  id: number;
  logo: {
    url: string;
    alternativeText: string;
  };
  description?: string;
  links: {
    label: string;
    url: string;
  }[];
  social_links: {
    platform: string;
    url: string;
  }[];
  copyright?: string;
}
