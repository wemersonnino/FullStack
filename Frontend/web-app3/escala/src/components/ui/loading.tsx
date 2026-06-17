'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: number;
  text?: string;
}

export function Loading({ className, size = 32, text }: LoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <Loader2 
        className="animate-spin text-primary" 
        size={size} 
        aria-label="Carregando..."
      />
      {text && <p className="mt-4 text-sm text-muted-foreground animate-pulse">{text}</p>}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loading size={48} text="Carregando plataforma..." />
    </div>
  );
}
