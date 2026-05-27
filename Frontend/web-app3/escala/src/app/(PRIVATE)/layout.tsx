import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/shared/Sidebar';
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
        <main className="min-w-0 flex-1 px-4 py-20 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
