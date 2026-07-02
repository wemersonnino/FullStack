'use client';

import { Loading } from '@/components/ui/loading';

export default function PrivateLoading() {
  return (
    <div className="flex w-full min-h-[60vh] items-center justify-center">
      <Loading size={48} text="Carregando conteúdo..." />
    </div>
  );
}
