'use client';

import { Bell, ChevronDown, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const HeaderPrivate = () => {
  const { session, logout } = useAuth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-20 mb-6 flex h-16 items-center justify-end gap-3 border-b bg-background/90 px-4 backdrop-blur md:px-8">
      <Button type="button" variant="ghost" size="icon" aria-label="Notificacoes">
        <Bell className="size-5" />
      </Button>
      <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
        <div className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {user?.username?.slice(0, 1).toUpperCase() || 'U'}
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="max-w-40 truncate text-sm font-medium">{user?.username}</p>
          <p className="max-w-40 truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
      </div>
      <Button type="button" variant="outline" size="sm" asChild>
        <Link href="/dashboard/perfil">
          <User className="size-4" />
          Perfil
        </Link>
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={logout} aria-label="Sair">
        <LogOut className="size-5" />
      </Button>
    </header>
  );
};
