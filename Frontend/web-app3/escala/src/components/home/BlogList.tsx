import { Article } from "@/interfaces/article/article.interface";
import { BlogCard } from "@/components/home/BlogCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const BlogList = ({ articles = [] }: { articles?: Article[] }) => {
  if (!articles || articles.length === 0) {
    return (
      <section className="bg-background py-10 text-center text-foreground">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-2xl font-bold">Últimos artigos</h2>
          <p className="text-muted-foreground">Não existem artigos publicados no momento.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background py-10 text-foreground">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Últimos artigos</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/artigos">Ver todos</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
};
