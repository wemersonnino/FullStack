import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/shared/Sidebar';
import { HeaderPrivate } from '@/components/shared/HeaderPrivate';
import { LeadBanner } from '@/components/dashboard/LeadBanner';
import { getMenu } from '@/services/menu.service';
import { MenuLocationEnum } from '@/interfaces/enums/menuLocation.enum';
import { getMyProfile } from '@/services/profile.service';

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const [sidebarItems, profile] = await Promise.all([
    getMenu(MenuLocationEnum.SIDEBAR),
    getMyProfile(session.user.token).catch(() => null),
  ]);
  const freshUser = profile ? { ...session.user, ...profile } : session.user;

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar items={sidebarItems} user={freshUser} />
        <main className="min-w-0 flex-1 px-4 pb-8 pt-10 md:pl-10 md:pr-8 md:pt-0">
          <HeaderPrivate user={freshUser} />
          <LeadBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
