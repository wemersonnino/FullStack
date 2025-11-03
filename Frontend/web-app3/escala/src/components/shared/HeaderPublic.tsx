'use client';

import { useEffect, useState } from 'react';
import { getMenu } from '@/services/menu.service';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Menu } from './Menu';
import { MenuItem } from '@/interfaces/menu/menu.interface';
import { MenuLocationEnum } from '@/interfaces/enums/menuLocation.enum';

export const HeaderPublic = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);

  useEffect(() => {
    getMenu(MenuLocationEnum.HEADER).then(setMenu);
  }, []);

  return (
    <header className="flex w-full items-center justify-between bg-white p-4 shadow-md dark:bg-gray-800">
      <h1 className="text-2xl font-bold">Plataforma Escala</h1>
      <Menu items={menu} />
      <ThemeToggle />
    </header>
  );
};
