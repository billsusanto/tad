'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded-lg border bg-bg-secondary px-3 text-sm text-text-primary',
            'placeholder:text-text-muted',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-error focus:ring-error'
              : 'border-border-default hover:border-border-hover',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-error">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
