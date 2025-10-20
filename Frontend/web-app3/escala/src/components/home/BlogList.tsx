import { Article } from "@/interfaces/article/article.interface";
import { BlogCard } from "@/components/home/BlogCard";

export const BlogList = ({ articles = [] }: { articles?: Article[] }) => {
  // caso o array esteja vazio
  if (!articles || articles.length === 0) {
    return (
      <section className="py-10 bg-gray-50 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Últimos artigos</h2>
          <p className="text-gray-600">Nenhum artigo disponível no momento.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Últimos artigos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
};
