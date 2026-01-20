'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          'inline-flex items-center gap-2 cursor-pointer select-none',
          props.disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'h-5 w-5 rounded border-2 transition-all duration-150',
              'flex items-center justify-center',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-primary',
              checked
                ? 'bg-brand-primary border-brand-primary'
                : 'bg-transparent border-border-default hover:border-brand-primary/50'
            )}
          >
            <Check
              className={cn(
                'h-3 w-3 text-bg-primary transition-transform duration-150',
                checked ? 'scale-100' : 'scale-0'
              )}
              strokeWidth={3}
            />
          </div>
        </div>
        {label && (
          <span className="text-sm text-text-primary">{label}</span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
