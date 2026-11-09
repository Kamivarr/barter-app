import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.ComponentProps<'span'> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center font-medium rounded-lg border transition-colors select-none';

    const variants = {
      default: 'bg-stone-800 text-stone-300 border-stone-700/80',
      primary: 'bg-orange-600/15 text-orange-400 border-orange-500/30',
      success: 'bg-emerald-600/15 text-emerald-400 border-emerald-500/30',
      warning: 'bg-amber-600/15 text-amber-400 border-amber-500/30',
      danger: 'bg-red-600/15 text-red-400 border-red-500/30',
      info: 'bg-blue-600/15 text-blue-400 border-blue-500/30',
      purple: 'bg-purple-600/15 text-purple-400 border-purple-500/30',
      outline: 'bg-transparent text-stone-300 border-stone-700',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-[11px]',
      md: 'px-2.5 py-1 text-xs',
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
