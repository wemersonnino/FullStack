'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Briefcase,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Settings,
  User,
  Users,
  ArrowLeftRight,
  ClipboardList,
  UserPlus,
  BarChart4,
  Megaphone,
  ShieldCheck,
  CreditCard,
  GraduationCap
} from 'lucide-react';
import { MenuItem } from '@/interfaces/menu/menu.interface';
import { cn, resolveAvatarUrl } from '@/lib/utils';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  items: MenuItem[];
  user: {
    username?: string | null;
    email?: string | null;
    roles?: string[];
    avatarUrl?: string | null;
    image?: string | null;
    picture?: string | null;
    avatar?: string | { url?: string | null } | null;
  };
}

// Organização Profissional por Categorias (Serviços)
const navigationGroups = [
  {
    title: 'Operacional',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Minhas Escalas', href: '/dashboard/escala', icon: CalendarDays },
      { title: 'Trocas de Turno', href: '/dashboard/escala/trocas', icon: ArrowLeftRight },
    ]
  },
  {
    title: 'Gestão de Equipe',
    roles: ['ADMIN', 'OWNER', 'MANAGER'],
    items: [
      { title: 'Colaboradores', href: '/dashboard/team', icon: Users },
      { title: 'Convidar Membros', href: '/dashboard/team/invites', icon: UserPlus },
      { title: 'Projetos', href: '/dashboard/projetos', icon: Briefcase },
      { title: 'Setores / Unidades', href: '/dashboard/setores', icon: Layers },
    ]
  },
  {
    title: 'Administração',
    roles: ['ADMIN', 'OWNER'],
    items: [
      { title: 'Empresas (Tenants)', href: '/dashboard/empresas', icon: Building2 },
      { title: 'Relatórios Avançados', href: '/dashboard/relatorios', icon: BarChart4 },
      { title: 'Planos e Faturamento', href: '/dashboard/billing/plans', icon: CreditCard },
      { title: 'ReBAC Jethro', href: '/dashboard/rebac', icon: ShieldCheck },
      { title: 'Auditoria e Logs', href: '/dashboard/auditoria', icon: ShieldCheck },
    ]
  },
  {
    title: 'Marketing',
    roles: ['ADMIN', 'OWNER', 'MARKETING'],
    items: [
      { title: 'Métricas de Marketing', href: '/dashboard/marketing', icon: Megaphone },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { title: 'Meu Perfil', href: '/dashboard/perfil', icon: User },
      { title: 'Aprendizado', href: '/dashboard/aprendizado', icon: GraduationCap },
      { title: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
    ]
  }
];

export const Sidebar = ({ items, user }: SidebarProps) => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const avatarSrc = resolveAvatarUrl(user);

  const filteredGroups = useMemo(() => {
    const userRoles = user.roles || [];
    return navigationGroups.filter(group => {
      if (!group.roles) return true;
      return group.roles.some(role => userRoles.includes(role));
    });
  }, [user.roles]);

  const sidebarContent = (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-card text-card-foreground shadow-lg transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Logo Area */}
      <div className="flex h-20 items-center justify-between px-6 border-b bg-primary/5">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="rounded-lg bg-primary p-1.5 transition-transform group-hover:scale-110">
               <ClipboardList className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-primary">ESCALA</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 leading-none">Plataforma SaaS</span>
            </div>
          </Link>
        )}
        {collapsed && (
            <div className="mx-auto rounded-lg bg-primary p-1.5">
               <ClipboardList className="h-6 w-6 text-primary-foreground" />
            </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-muted">
        {filteredGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            {!collapsed && (
              <h3 className="px-4 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group relative',
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                          : 'text-muted-foreground hover:bg-primary/10 hover:text-primary',
                        collapsed && 'justify-center px-0'
                      )}
                    >
                      <item.icon className={cn(
                        'size-5 transition-transform group-hover:scale-110',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                      )} />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                      
                      {isActive && !collapsed && (
                         <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary-foreground/50" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="mt-auto border-t bg-muted/30 p-4">
        <div className={cn(
            "flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm border transition-all",
            collapsed ? "justify-center p-2" : "px-4"
        )}>
          <Avatar className="h-10 w-10 border-2 border-primary/10 transition-transform hover:scale-105 overflow-hidden relative">
            {avatarSrc ? (
              <Image 
                src={avatarSrc} 
                alt={user.username || 'Usuario'} 
                fill
                sizes="40px"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {user.username?.slice(0, 2).toUpperCase() || 'US'}
              </AvatarFallback>
            )}
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold leading-none mb-1">{user.username}</p>
              <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="truncate text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {user.roles?.[0] || 'Membro'}
                  </p>
              </div>
            </div>
          )}
        </div>

        <div className={cn(
            "mt-4 flex gap-2 items-center",
            collapsed ? "flex-col" : "justify-between px-2"
        )}>
           <div className="flex gap-1">
                <ThemeToggle />
                {!collapsed && (
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary" asChild>
                        <Link href="/dashboard/perfil">
                            <Settings className="h-4 w-4" />
                        </Link>
                    </Button>
                )}
           </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={logout}
            className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
      
      {/* Collapse Toggle (Floating) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 hidden h-6 w-6 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-md transition-all hover:text-primary md:flex cursor-pointer"
      >
        {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
      </button>
    </aside>
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 md:hidden bg-card/80 backdrop-blur-sm"
      >
        <MenuIcon className="size-4" />
      </Button>

      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:block">{sidebarContent}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-72 shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}

      <div className={cn('hidden transition-[width] duration-300 md:block', collapsed ? 'w-20' : 'w-72')} />
    </>
  );
};
