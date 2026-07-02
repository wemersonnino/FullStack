import { Sidebar } from '@/components/shared/Sidebar';
import { HeaderPrivate } from '@/components/shared/HeaderPrivate';
import { LeadBanner } from '@/components/dashboard/LeadBanner';
import { getMenu } from '@/services/menu.service';
import { MenuLocationEnum } from '@/interfaces/enums/menuLocation.enum';
import { getMyProfile } from '@/services/profile.service';
import { getGlobal } from '@/services/global.service';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';
import { sanitizeClientUser } from '@/lib/auth/client-user';
import { MessageService } from '@/core/application/services/message.service';

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { session, accessToken } = await getRequiredServerAuth();

  const [sidebarItems, profile, global, initialMessages] = await Promise.all([
    getMenu(MenuLocationEnum.SIDEBAR),
    getMyProfile(accessToken).catch(() => null),
    getGlobal(),
    MessageService.listMessages(accessToken, 'PENDING').catch(() => []),
  ]);
  const freshUser = profile ? { ...session.user, ...profile } : session.user;
  const clientUser = sanitizeClientUser(freshUser);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar items={sidebarItems} global={global} user={clientUser} />
        <main className="min-w-0 flex-1 px-4 pb-8 pt-10 md:pl-10 md:pr-8 md:pt-0">
          <HeaderPrivate user={clientUser} initialMessages={initialMessages} />
          <LeadBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
