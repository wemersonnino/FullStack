'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 text-4xl font-bold text-gray-800">Página não encontrada</h1>
      <p className="mb-6 text-gray-600">
        O recurso que você está tentando acessar não existe ou foi movido.
      </p>
      <Link
        href="/home"
        className="rounded-md bg-fundep-blue px-4 py-2 font-medium text-white transition-colors hover:bg-blue-900"
      >
        Voltar à página inicial
      </Link>
    </main>
  );
}
