import { HeaderPublic } from '@/components/shared/HeaderPublic';
import { getFooter } from '@/services/footer.service';
import { Footer } from '@/components/shared/Footer';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const footer = await getFooter();
  return (
    <>
      <HeaderPublic />
      <main className="min-h-screen">{children}</main>
      <Footer data={footer} />
    </>
  );
}
