import { TeamInviteManager } from '@/components/dashboard/TeamInviteManager';

export const metadata = {
  title: 'Convidar Equipe | Plataforma Escala',
};

export default function TeamInvitesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Equipe</h1>
        <p className="text-muted-foreground">
          Envie convites para novos colaboradores e gerencie as permissões de acesso.
        </p>
      </div>
      
      <TeamInviteManager />
    </div>
  );
}
