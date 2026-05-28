'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Settings,
  User,
  Users,
  X,
} from 'lucide-react';
import { MenuItem } from '@/interfaces/menu/menu.interface';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  items: MenuItem[];
  user: {
    username?: string | null;
    email?: string | null;
    roles?: string[];
  };
}

const fallbackItems: MenuItem[] = [
  {
    id: -1,
    title: 'Dashboard',
    order: 1,
    active: true,
    destination: '/dashboard',
    location: 'sidebar' as MenuItem['location'],
  },
  {
    id: -2,
    title: 'Team',
    order: 2,
    active: true,
    destination: '/dashboard/team',
    location: 'sidebar' as MenuItem['location'],
  },
  {
    id: -3,
    title: 'Escalas',
    order: 3,
    active: true,
    destination: '/dashboard/escala',
    location: 'sidebar' as MenuItem['location'],
  },
  {
    id: -5,
    title: 'Admin Escalas',
    order: 5,
    active: true,
    destination: '/dashboard/escala/admin',
    location: 'sidebar' as MenuItem['location'],
  },
  {
    id: -4,
    title: 'Configurações',
    order: 4,
    active: true,
    destination: '/dashboard/perfil',
    location: 'sidebar' as MenuItem['location'],
  },
];

function fallbackIcon(item: MenuItem) {
  const key = `${item.slug || ''} ${item.title || ''} ${item.destination || ''}`.toLowerCase();

  if (key.includes('perfil') || key.includes('profile')) return <User className="size-5" />;
  if (key.includes('funcionario') || key.includes('employee')) return <Users className="size-5" />;
  if (key.includes('escala') || key.includes('calendar') || key.includes('schedule')) {
    return <CalendarDays className="size-5" />;
  }
  if (key.includes('config') || key.includes('setting')) return <Settings className="size-5" />;
  return <LayoutDashboard className="size-5" />;
}

function SidebarIcon({ item }: { item: MenuItem }) {
  if (item.icon?.url) {
    return (
      <Image
        src={item.icon.url}
        alt={item.icon.alternativeText || item.title}
        width={20}
        height={20}
        className="size-5 object-contain"
      />
    );
  }

  return fallbackIcon(item);
}

function normalizeHref(destination?: string | null) {
  const href = destination?.trim();
  return href || null;
}

export const Sidebar = ({ items, user }: SidebarProps) => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({});

  const menuItems = useMemo(() => {
    const activeItems = items.filter((item) => item.active);
    const sourceItems = activeItems.length ? activeItems : fallbackItems;

    return sourceItems.map((item) => {
      const key = `${item.slug || ''} ${item.title || ''}`.toLowerCase();
      if (key.includes('team') || key.includes('equipe')) {
        return { ...item, destination: '/dashboard/team' };
      }
      return item;
    });
  }, [items]);

  const activeHref = useMemo(() => {
    const hrefs = menuItems
      .flatMap((item) => [
        normalizeHref(item.destination),
        ...(item.childItems?.filter((child) => child.active).map((child) => normalizeHref(child.destination)) || []),
      ])
      .filter((href): href is string => Boolean(href))
      .sort((a, b) => b.length - a.length);

    return hrefs.find((href) => pathname === href || pathname.startsWith(`${href}/`)) || null;
  }, [menuItems, pathname]);

  function toggleGroup(id: number) {
    setOpenGroups((current) => ({ ...current, [id]: !current[id] }));
  }

  const sidebar = (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-background text-foreground shadow-sm transition-[width] duration-200',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="min-w-0">
            <span className="block truncate text-sm font-semibold">Plataforma Escala</span>
            <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
          </Link>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="hidden md:inline-flex"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
          className="md:hidden"
        >
          <X className="size-4" />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const href = normalizeHref(item.destination);
            const children = item.childItems?.filter((child) => child.active) || [];
            const isGroup = children.length > 0;
            const isOpen = openGroups[item.id] ?? true;
            const isActive = href ? activeHref === href : false;

            return (
              <li key={item.id}>
                {isGroup ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.id)}
                    className={cn(
                      'flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition hover:bg-muted',
                      collapsed && 'justify-center px-0'
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <SidebarIcon item={item} />
                    {!collapsed && (
                      <>
                        <span className="min-w-0 flex-1 truncate text-left">{item.title}</span>
                        <ChevronDown className={cn('size-4 transition', !isOpen && '-rotate-90')} />
                      </>
                    )}
                  </button>
                ) : href ? (
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition hover:bg-muted',
                      isActive && 'bg-primary text-primary-foreground hover:bg-primary/90',
                      collapsed && 'justify-center px-0'
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <SidebarIcon item={item} />
                    {!collapsed && <span className="min-w-0 truncate">{item.title}</span>}
                  </Link>
                ) : null}

                {isGroup && isOpen && !collapsed && (
                  <ul className="mt-1 space-y-1 pl-8">
                    {children.map((child) => {
                      const childHref = normalizeHref(child.destination);
                      if (!childHref) return null;

                      const childActive = activeHref === childHref;
                      return (
                        <li key={child.id}>
                          <Link
                            href={childHref}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              'block rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground',
                              childActive && 'bg-muted text-foreground'
                            )}
                          >
                            {child.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t p-3">
        <div className={cn('mb-3 flex items-center gap-3 px-2', collapsed && 'justify-center px-0')}>
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {user.username?.slice(0, 1).toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.username}</p>
              <p className="truncate text-xs text-muted-foreground">{user.roles?.join(', ')}</p>
            </div>
          )}
        </div>
        <div className={cn('flex gap-2', collapsed && 'flex-col')}>
          <ThemeToggle />
          <Button type="button" variant="outline" size={collapsed ? 'icon' : 'sm'} onClick={logout}>
            <LogOut className="size-4" />
            {!collapsed && <span>Sair</span>}
          </Button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
        className="fixed left-4 top-4 z-40 md:hidden"
      >
        <MenuIcon className="size-4" />
      </Button>

      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:block">{sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/45"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-72">{sidebar}</div>
        </div>
      )}

      <div className={cn('hidden transition-[width] duration-200 md:block', collapsed ? 'w-20' : 'w-72')} />
    </>
  );
};
