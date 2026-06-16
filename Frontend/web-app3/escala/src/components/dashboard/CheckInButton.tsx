'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Map } from '@/components/shared/Map';
import { GeoPoint } from '@/core/domain/models/map.model';

interface CheckInButtonProps {
  companyLocation?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export function CheckInButton({ companyLocation }: CheckInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [userPos, setUserPos] = useState<GeoPoint | null>(null);

  // Busca a posição do usuário ao carregar para mostrar no mapa
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleCheckIn = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    setLoading(true);
    setStatus('idle');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentPos = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserPos(currentPos);

        try {
          const response = await fetch('/api/server/api/v1/check-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: currentPos.lat,
              longitude: currentPos.lng,
              deviceFingerprint: navigator.userAgent,
            }),
          });

          if (response.ok) {
            toast.success('Ponto batido com sucesso!');
            setStatus('success');
          } else {
            const error = await response.json();
            toast.error(error.message || 'Você está fora do raio permitido.');
            setStatus('error');
          }
        } catch {
          toast.error('Erro ao conectar com o servidor.');
          setStatus('error');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setStatus('error');
        // ... (erros de permissão omitidos para brevidade no replace)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-3xl border bg-card shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
            <div className={`rounded-full p-2 ${
                status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'
            }`}>
                <Navigation className="h-4 w-4" />
            </div>
            <div>
                <h3 className="text-sm font-bold">Presença Digital</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Validação via Geofencing</p>
            </div>
        </div>
        {status === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
      </div>

      {/* Visual Map Feedback */}
      <div className="relative overflow-hidden rounded-2xl border bg-muted/20">
        <Map 
          center={userPos || (companyLocation ? { lat: companyLocation.latitude, lng: companyLocation.longitude } : { lat: -23.5505, lng: -46.6333 })}
          zoom={16}
          className="h-[180px] w-full"
          interactive={false}
          markers={userPos ? [{ position: userPos, title: "Sua Posição" }] : []}
          geofence={companyLocation ? {
            center: { lat: companyLocation.latitude, lng: companyLocation.longitude },
            radius: companyLocation.radius,
            color: status === 'success' ? '#10b981' : '#3b82f6'
          } : undefined}
        />
        {!userPos && (
             <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px] z-[1000]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Aguardando GPS...</p>
             </div>
        )}
      </div>

      <Button 
        onClick={handleCheckIn} 
        disabled={loading || status === 'success'}
        className={`w-full h-11 rounded-xl font-bold transition-all shadow-lg ${
            status === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'shadow-primary/20'
        }`}
      >
        {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validando...</>
        ) : status === 'success' ? 'Ponto Confirmado' : 'Registrar Ponto'}
      </Button>
    </div>
  );
}
