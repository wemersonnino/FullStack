export interface Announcement {
  id: number;
  title: string;
  slug: string;
  content: string;
  image?: string;
  category: "news" | "alert" | "policy" | "update";
  publishedAt: string;
}
