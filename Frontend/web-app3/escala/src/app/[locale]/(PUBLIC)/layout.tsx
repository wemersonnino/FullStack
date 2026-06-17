import { HeaderPublic } from '@/components/shared/HeaderPublic';
import { getFooter } from '@/services/footer.service';
import { Footer } from '@/components/shared/Footer';
import { getGlobal } from '@/services/global.service';
import { getMenu } from '@/services/menu.service';
import { MenuLocationEnum } from '@/interfaces/enums/menuLocation.enum';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [footer, global, menuItems] = await Promise.all([
    getFooter(),
    getGlobal(),
    getMenu(MenuLocationEnum.HEADER),
  ]);

  return (
    <>
      <HeaderPublic global={global} menuItems={menuItems} />
      <main className="min-h-screen">{children}</main>
      <Footer data={footer} />
    </>
  );
}
