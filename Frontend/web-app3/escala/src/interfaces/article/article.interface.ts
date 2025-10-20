import { AuthorInterface } from "@/interfaces/article/author.interface";
import { CategoryInterface } from "@/interfaces/article/category.interface";

export interface Article {
  id: number;
  title: string;
  description: string;
  slug: string;
  cover_image: {
    url: string;
    alternativeText: string;
  };
  author?: AuthorInterface;
  category?: CategoryInterface;
  published_at: string;
  content?: string;
}
