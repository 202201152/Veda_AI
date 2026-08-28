import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'orange-border' | 'dashed-error';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-slate-border rounded-xl shadow-sm',
      flat: 'bg-white border border-slate-border rounded-xl',
      'orange-border': 'bg-white border border-primary rounded-xl shadow-sm',
      'dashed-error': 'bg-red-50/20 border-2 border-dashed border-status-error/60 rounded-xl',
    };

    return (
      <div
        ref={ref}
        className={twMerge(clsx(variants[variant], className))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
