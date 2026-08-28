import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'charcoal' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 select-none';

    const variants = {
      primary:
        'bg-primary hover:bg-primary-dark text-white rounded-lg shadow-sm border border-transparent',
      secondary:
        'bg-white hover:bg-primary-light/50 text-slate-text-primary border border-slate-border rounded-lg shadow-sm',
      charcoal:
        'bg-charcoal hover:bg-charcoal-dark text-white border border-primary rounded-full shadow-sm',
      outline:
        'bg-transparent hover:bg-slate-100 text-slate-text-primary border border-slate-border rounded-lg',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-text-secondary hover:text-slate-text-primary rounded-lg',
      danger:
        'bg-status-error hover:bg-red-700 text-white rounded-lg shadow-sm',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-5 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0 rounded-full',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(
          clsx(
            baseStyles,
            variants[variant],
            sizes[size],
            className
          )
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
