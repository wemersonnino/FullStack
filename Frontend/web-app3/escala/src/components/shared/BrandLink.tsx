'use client';

import { ClipboardList } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { GlobalInterface } from '@/interfaces/global/global.interface';
import { cn } from '@/lib/utils';

type BrandLinkProps = {
  global?: GlobalInterface | null;
  href?: string;
  collapsed?: boolean;
  className?: string;
};

export function BrandLink({ global, href = '/', collapsed = false, className }: BrandLinkProps) {
  const siteName = global?.siteName || 'Escala SaaS';
  const logo = global?.logo;
  const expandedWidth = 180;
  const expandedHeight = 40;
  const collapsedSize = 40;

  return (
    <Link href={href} className={cn('group flex items-center gap-2', className)} aria-label={siteName}>
      {logo?.url ? (
        <Image
          src={logo.url}
          alt={logo.alternativeText || siteName}
          width={collapsed ? collapsedSize : expandedWidth}
          height={collapsed ? collapsedSize : expandedHeight}
          className={cn(
            'rounded-lg object-contain',
            collapsed ? 'h-10 w-10' : 'h-10 max-w-[180px]'
          )}
          style={collapsed ? undefined : { width: 'auto', height: `${expandedHeight}px` }}
          priority
        />
      ) : (
        <>
          <div className="rounded-lg bg-primary p-1.5 transition-transform group-hover:scale-110">
            <ClipboardList className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-xl font-black tracking-tighter text-primary">
              {siteName}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
