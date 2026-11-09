import React from 'react';
import { Clock, CheckCircle2, KeyRound, CheckCheck, XCircle, LucideIcon } from 'lucide-react';
import { RentalStatus } from '@/types/domain';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps extends React.ComponentProps<'span'> {
  status: RentalStatus | string;
}

interface StatusConfig {
  label: string;
  className: string;
  icon: LucideIcon;
}

const STATUS_CONFIGS: Record<RentalStatus, StatusConfig> = {
  PENDING: {
    label: 'Oczekuje na akceptację',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: Clock,
  },
  APPROVED: {
    label: 'Zaakceptowane (Gotowe do odbioru)',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    icon: CheckCircle2,
  },
  ACTIVE: {
    label: 'W trakcie wypożyczenia',
    className: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    icon: KeyRound,
  },
  RETURNED: {
    label: 'Zwrócone i rozliczone',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: CheckCheck,
  },
  CANCELLED: {
    label: 'Anulowane',
    className: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: XCircle,
  },
};

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const normalizedStatus = (status as RentalStatus) in STATUS_CONFIGS
    ? (status as RentalStatus)
    : 'PENDING';

  const config = STATUS_CONFIGS[normalizedStatus];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border select-none transition-colors',
        config.className,
        className
      )}
      {...props}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
