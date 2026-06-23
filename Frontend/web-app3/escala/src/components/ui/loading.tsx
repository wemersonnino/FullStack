'use client';

import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { Empty, EmptyHeader, EmptyMedia, EmptyDescription } from '@/components/ui/empty';

interface LoadingProps {
  className?: string;
  size?: number;
  text?: string;
}

export function Loading({ className, size = 32, text }: LoadingProps) {
  return (
    <Empty className={cn("border-none min-h-[200px] p-4", className)}>
      <EmptyHeader>
        <EmptyMedia>
          <Spinner 
            className="text-primary animate-spin" 
            style={{ width: size, height: size }}
          />
        </EmptyMedia>
        {text && <EmptyDescription className="mt-2 animate-pulse">{text}</EmptyDescription>}
      </EmptyHeader>
    </Empty>
  );
}

export function LoadingPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loading size={48} text="Carregando plataforma..." />
    </div>
  );
}
