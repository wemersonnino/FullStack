import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const tones = {
  slate: {
    iconWrap: 'bg-slate-950 text-white',
    border: 'border-slate-200',
  },
  blue: {
    iconWrap: 'bg-blue-600 text-white',
    border: 'border-blue-100',
  },
  amber: {
    iconWrap: 'bg-amber-500 text-slate-950',
    border: 'border-amber-100',
  },
  emerald: {
    iconWrap: 'bg-emerald-600 text-white',
    border: 'border-emerald-100',
  },
  rose: {
    iconWrap: 'bg-rose-600 text-white',
    border: 'border-rose-100',
  },
} as const;

type DashboardStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  className?: string;
};

export function DashboardStatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'slate',
  className,
}: DashboardStatCardProps) {
  const palette = tones[tone];

  return (
    <div
      className={cn(
        'rounded-[28px] border bg-card p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md',
        palette.border,
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-black tracking-tight text-foreground">
            {value}
          </p>
          {hint ? (
            <p className="text-sm leading-5 text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>

        <div className={cn('rounded-2xl p-3 shadow-sm', palette.iconWrap)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
