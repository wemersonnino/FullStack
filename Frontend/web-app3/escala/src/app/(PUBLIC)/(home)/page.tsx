import { BlogList } from "@/components/home/BlogList";
import { getBanner } from "@/services/banner.service";
import { getArticles } from "@/services/article.service";
import { getFooter } from "@/services/footer.service";
import { BannerCarousel } from "@/components/shared/BannerCarousel";

export default async function HomePage() {
  const [banners, articles, footer] = await Promise.all([
    getBanner(),
    getArticles(6),
    getFooter(),
  ]);

  return (
    <>
      {banners && banners.length > 0 ? (
        <BannerCarousel banners={banners} interval={5000} />
      ) : (
        <BannerCarousel banners={[]} />
      )}
      <BlogList articles={articles} />
    </>
  );
}
