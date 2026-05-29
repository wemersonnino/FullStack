import { AuthorInterface } from "@/interfaces/article/author.interface";
import { CategoryInterface } from "@/interfaces/article/category.interface";

export interface ArticleMedia {
  id: number;
  url: string;
  alternativeText?: string;
  caption?: string;
  name?: string;
  mime?: string;
  ext?: string;
  width?: number;
  height?: number;
}

export type ArticleBlock =
  | {
      id: number;
      __component: "shared.rich-text";
      body: string;
    }
  | {
      id: number;
      __component: "shared.media";
      file?: ArticleMedia;
    }
  | {
      id: number;
      __component: "shared.slider";
      files: ArticleMedia[];
    }
  | {
      id: number;
      __component: "shared.quote";
      title?: string;
      body?: string;
    }
  | {
      id: number;
      __component: string;
      [key: string]: unknown;
    };

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
  blocks: ArticleBlock[];
}
