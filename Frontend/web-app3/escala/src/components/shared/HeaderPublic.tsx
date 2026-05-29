'use client';

import { Check, ClipboardList, LogIn, Menu as MenuIcon, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

export const HeaderPublic = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const navLinks = [
    { name: 'Funcionalidades', href: '#features' },
    { name: 'Preços', href: '#pricing' },
    { name: 'Segurança', href: '#security' },
    { name: 'Blog', href: '#blog' },
  ];

  return (
    <header className="fixed top-0 z-[100] w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="rounded-lg bg-primary p-1.5 transition-transform group-hover:rotate-12">
            <ClipboardList className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-black tracking-tighter text-primary">ESCALA<span className="text-foreground">SaaS</span></span>
        </Link>

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
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="font-bold">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full px-6 shadow-lg shadow-primary/20">
                <Link href="/register">Teste Grátis</Link>
              </Button>
            </div>
          )}

          {/* Mobile Toggle */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
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
              <Link href="/register">Começar Teste de 90 Dias</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};
