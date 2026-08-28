import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'charcoal' | 'orange' | 'outline';
  shape?: 'pill' | 'circle' | 'rounded';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'neutral',
      shape = 'pill',
      size = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium select-none';

    const variants = {
      success: 'bg-highlight-green-light text-status-success border border-status-success/20',
      warning: 'bg-amber-50 text-status-warning border border-status-warning/20',
      error: 'bg-red-50 text-status-error border border-status-error/20',
      neutral: 'bg-slate-100 text-slate-text-secondary border border-slate-border',
      charcoal: 'bg-charcoal text-white',
      orange: 'bg-primary-light text-primary border border-primary/20',
      outline: 'bg-white text-slate-text-primary border border-slate-border',
    };

    const shapes = {
      pill: 'rounded-full',
      circle: 'rounded-full aspect-square',
      rounded: 'rounded-md',
    };

    const sizes = {
      sm: shape === 'circle' ? 'w-5 h-5 text-[10px]' : 'px-2 py-0.5 text-xs',
      md: shape === 'circle' ? 'w-6 h-6 text-xs font-semibold' : 'px-2.5 py-0.5 text-xs font-medium',
      lg: shape === 'circle' ? 'w-8 h-8 text-sm font-semibold' : 'px-3 py-1 text-sm font-medium',
    };

    return (
      <span
        ref={ref}
        className={twMerge(
          clsx(
            baseStyles,
            variants[variant],
            shapes[shape],
            sizes[size],
            className
          )
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
