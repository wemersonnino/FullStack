import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DashboardPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
};

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: DashboardPageHeaderProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-[32px] border border-slate-200/80 bg-[linear-gradient(135deg,#f6f3ec_0%,#ffffff_46%,#eef5ff_100%)] shadow-sm',
        className
      )}
    >
      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:p-8">
        <div className="space-y-4">
          <span className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white">
            {eyebrow}
          </span>
          <div className="space-y-2">
            <h1 className="max-w-4xl text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              {title}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              {description}
            </p>
          </div>
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
