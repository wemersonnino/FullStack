import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <main className="flex flex-col gap-8 items-center text-center max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight">
          Escala
        </h1>
        <p className="text-xl text-muted-foreground">
          Sistema de Gestão de Turnos e Escalas
        </p>
        <p className="text-lg">
          Aplicação full-stack construída com Next.js 15, Strapi v5 e PostgreSQL 16
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
          <Link
            href="/dashboard"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-12 px-8"
          >
            Dashboard
          </Link>
          <Link
            href="/auth/signin"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-12 px-8"
          >
            Entrar
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">Gestão de Usuários</h3>
            <p className="text-sm text-muted-foreground">
              Controle completo de usuários e permissões
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">Escalas e Turnos</h3>
            <p className="text-sm text-muted-foreground">
              Organize e gerencie escalas de trabalho
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">Auditoria</h3>
            <p className="text-sm text-muted-foreground">
              Rastreamento completo de todas as ações
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
