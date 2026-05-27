import Link from 'next/link';

export const metadata = {
  title: 'Acesso negado | Plataforma Escala',
};

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Acesso negado</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Sua conta não tem permissão para acessar esta área.
        </p>
        <Link
          href="/"
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium"
        >
          Voltar para o início
        </Link>
      </section>
    </main>
  );
}
