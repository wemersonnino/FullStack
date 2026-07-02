import { TeamInviteManager } from '@/components/dashboard/TeamInviteManager';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Convidar Equipe | Plataforma Escala',
};

export default async function TeamInvitesPage() {
  const { session } = await getRequiredServerAuth();
  const roles = session?.user?.roles ?? [];
  const canAccess = roles.includes('ADMIN') || roles.includes('OWNER');

  if (!canAccess) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">Convites e Onboarding</h1>
        <p className="text-muted-foreground">
          Emita convites com link transitório, acompanhe o status e reduza exposição administrativa de credenciais.
        </p>
      </div>
      
      <TeamInviteManager />
    </div>
  );
}
