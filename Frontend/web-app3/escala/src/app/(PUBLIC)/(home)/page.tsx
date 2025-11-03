import { BlogList } from '@/components/home/BlogList';
import { getBanners } from '@/services/banner.service';
import { getArticles } from '@/services/article.service';
import { BannerCarousel } from '@/components/shared/BannerCarousel';

export default async function HomePage() {
  const [banners, articles] = await Promise.all([getBanners(), getArticles(6)]);

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
