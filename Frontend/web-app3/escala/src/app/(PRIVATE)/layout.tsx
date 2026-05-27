import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/shared/Sidebar';
import { HeaderPrivate } from '@/components/shared/HeaderPrivate';
import { getMenu } from '@/services/menu.service';
import { MenuLocationEnum } from '@/interfaces/enums/menuLocation.enum';

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const sidebarItems = await getMenu(MenuLocationEnum.SIDEBAR);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar items={sidebarItems} user={session.user} />
        <main className="min-w-0 flex-1 px-4 pb-8 pt-20 md:pl-80 md:pr-8 md:pt-0">
          <HeaderPrivate />
          {children}
        </main>
      </div>
    </div>
  );
}
