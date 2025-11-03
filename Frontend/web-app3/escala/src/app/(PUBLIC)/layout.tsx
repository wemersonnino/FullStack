import { HeaderPublic } from '@/components/shared/HeaderPublic';
import { AppProviders } from '@/components/shared/providers/AppProviders';
import { getFooter } from '@/services/footer.service';
import { Footer } from '@/components/shared/Footer';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const footer = await getFooter();
  return (
    <AppProviders>
      <HeaderPublic />
      <main className="min-h-screen">{children}</main>
      <Footer data={footer} />
    </AppProviders>
  );
}
