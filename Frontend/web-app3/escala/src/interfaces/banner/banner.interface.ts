export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  slug?: string;
  image: {
    url: string;
    alternativeText: string;
  };
  button_text: string;
  button_link: string;
}
