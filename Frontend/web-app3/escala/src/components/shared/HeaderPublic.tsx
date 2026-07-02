'use client';

import { Menu as MenuIcon, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useSession } from 'next-auth/react';
import { GlobalInterface } from '@/interfaces/global/global.interface';
import { MenuItem } from '@/interfaces/menu/menu.interface';
import { BrandLink } from '@/components/shared/BrandLink';

type HeaderPublicProps = {
  global?: GlobalInterface | null;
  menuItems?: MenuItem[];
};

const fallbackNavLinks = [
  { name: 'Funcionalidades', href: '#modulos' },
  { name: 'Setores', href: '#setores' },
  { name: 'Planos', href: '#pricing' },
  { name: 'Conteúdo', href: '#blog' },
];

function getNavLinks(menuItems?: MenuItem[]) {
  const cmsLinks = (menuItems || [])
    .filter((item) => item.active)
    .map((item) => ({
      name: item.title,
      href: item.destination?.trim() || '#',
    }));

  return cmsLinks.length ? cmsLinks : fallbackNavLinks;
}

export const HeaderPublic = ({ global, menuItems }: HeaderPublicProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const navLinks = getNavLinks(menuItems);

  return (
    <header className="fixed top-0 z-[100] w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <BrandLink global={global} href="/" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          {session ? (
            <Button asChild size="sm" className="rounded-full px-6">
              <Link href="/dashboard" prefetch={false}>Dashboard</Link>
            </Button>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="font-bold">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full px-6 shadow-lg shadow-primary/20">
                <Link href="/register">Teste grátis</Link>
              </Button>
            </div>
          )}

          {/* Mobile Toggle */}
          <button className="md:hidden cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full border-b bg-background p-6 shadow-xl animate-in slide-in-from-top duration-300 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium"
              >
                {link.name}
              </Link>
            ))}
            <hr />
            <Button asChild className="w-full">
              <Link href="/register">Começar teste grátis</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};
