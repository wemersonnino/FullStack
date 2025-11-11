'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';

interface DashboardClientProps {
  user: {
    id: string | number;
    username: string;
    email: string;
    theme?: ThemeEnum;
  };
}

export const DashboardClient = ({ user }: DashboardClientProps) => {
  const { logout } = useAuth();

  return (
    <section className="mx-auto mt-12 max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Bem-vindo, {user.username} 👋</h1>

      <div className="bg-background/50 space-y-2 rounded-lg border p-4">
        <p>
          <span className="font-semibold">Email:</span> {user.email}
        </p>
        <p>
          <span className="font-semibold">Tema:</span> {user.theme}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="destructive" onClick={logout}>
          Sair da conta
        </Button>
      </div>
    </section>
  );
};
