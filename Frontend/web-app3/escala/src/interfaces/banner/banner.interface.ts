export interface Banner {
  id: number;
  title: string;
  description?: string;
  image: {
    url: string;
    alternativeText: string;
  };
}
