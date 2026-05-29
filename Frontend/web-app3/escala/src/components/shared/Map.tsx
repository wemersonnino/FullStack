'use client';

import dynamic from 'next/dynamic';
import { MapProps } from '@/core/domain/models/map.model';
import { Loader2 } from 'lucide-react';

// Carregamento dinâmico do adaptador para evitar erros de SSR (Window is not defined)
const MapAdapter = dynamic(
  () => import('@/infrastructure/adapters/maps/LeafletMapAdapter'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] w-full items-center justify-center rounded-xl border bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
);

/**
 * Componente de Mapa Abstrato.
 * Atualmente utiliza Leaflet, mas pode ser trocado por Google Maps 
 * apenas alterando o import dinâmico acima sem afetar quem o consome.
 */
export function Map(props: MapProps) {
  return <MapAdapter {...props} />;
}
