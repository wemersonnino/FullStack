'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getMenu } from '@/services/menu.service';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Menu } from './Menu';
import { MenuItem } from '@/interfaces/menu/menu.interface';
import { MenuLocationEnum } from '@/interfaces/enums/menuLocation.enum';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, LayoutDashboard } from 'lucide-react';

export const HeaderPublic = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    getMenu(MenuLocationEnum.HEADER).then(setMenu);
  }, []);

  return (
    <header className="flex w-full items-center justify-between gap-4 bg-white p-4 shadow-md dark:bg-gray-800">
      <Link href="/" className="text-xl font-bold md:text-2xl">
        Plataforma Escala
      </Link>

      <div className="hidden flex-1 justify-center md:flex">
        <Menu items={menu} />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {session?.user?.token ? (
          <Button asChild size="sm">
            <Link href="/dashboard">
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/login">
                <LogIn className="size-4" />
                Login
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">
                <UserPlus className="size-4" />
                Cadastrar
              </Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
