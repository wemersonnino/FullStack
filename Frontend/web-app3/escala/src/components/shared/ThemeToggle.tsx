'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/stores/app.store';
import { useSession } from 'next-auth/react';
import { updateUserTheme } from '@/services/profile.service';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { data: session, update } = useSession();
  const { setTheme: setAppTheme } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const { updateTheme } = useAuth();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const current = theme === 'system' ? resolvedTheme : theme;

  const toggleTheme = async () => {
    const newTheme = current === 'dark' ? ThemeEnum.LIGHT : ThemeEnum.DARK;

    setTheme(newTheme);
    setAppTheme(newTheme);

    if (session?.user?.token) {
      toast.promise(
        (async () => {
          await updateUserTheme(newTheme); // PATCH CORRETO
          await update({ user: { ...session.user, theme: newTheme } }); // Atualiza sessão
        })(),
        {
          loading: 'Atualizando preferência de tema...',
          success:
            newTheme === 'dark'
              ? '🌙 Tema escuro ativado com sucesso!'
              : '☀️ Tema claro ativado com sucesso!',
          error: 'Erro ao salvar preferência de tema no Strapi.',
        }
      );
    } else {
      toast.info(
        newTheme === ThemeEnum.DARK
          ? '🌙 Tema escuro ativado localmente.'
          : '☀️ Tema claro ativado localmente.'
      );
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Alternar tema"
      className="transition-colors"
      aria-pressed={current === 'light'}
    >
      {current === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
    </Button>
  );
};
