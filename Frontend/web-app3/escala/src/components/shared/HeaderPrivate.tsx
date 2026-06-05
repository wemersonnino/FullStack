'use client';

import { Bell, ChevronDown, LogOut, User, Settings, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { normalizeAvatarUrl } from '@/lib/utils';

export const HeaderPrivate = () => {
  const { session, logout } = useAuth();
  const user = session?.user;

  const avatarSrc = normalizeAvatarUrl(user?.avatarUrl || (user as any)?.image);

  return (
    <header className="sticky top-0 z-20 mb-6 flex h-16 items-center justify-end gap-3 border-b bg-background/90 px-4 backdrop-blur md:px-8">
      <Button type="button" variant="ghost" size="icon" aria-label="Notificacoes" className="rounded-full">
        <Bell className="size-5" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative flex items-center gap-3 rounded-xl border bg-card px-3 py-6 transition-all hover:bg-muted/50">
            <Avatar className="size-9 border-2 border-primary/10 overflow-hidden relative">
              {avatarSrc ? (
                <Image 
                  src={avatarSrc} 
                  alt={user?.username || 'Usuario'} 
                  fill
                  sizes="36px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <AvatarFallback className="bg-primary text-sm font-black text-primary-foreground uppercase italic tracking-tighter">
                  {user?.username?.slice(0, 1).toUpperCase() || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="hidden min-w-0 flex-col items-start sm:flex">
              <p className="max-w-[120px] truncate text-sm font-bold leading-none">{user?.username}</p>
              <p className="max-w-[120px] truncate text-[10px] font-medium text-muted-foreground mt-1">{user?.email}</p>
            </div>
            <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-bold leading-none">{user?.username}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/perfil" className="cursor-pointer w-full flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/configuracoes" className="cursor-pointer w-full flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </Link>
            </DropdownMenuItem>
            {user?.roles?.includes('ADMIN') && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/auditoria" className="cursor-pointer w-full flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Administração</span>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair da conta</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
