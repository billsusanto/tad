'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Anchor } from '@/types';

interface AnchorChipProps {
  anchor: Anchor;
  size?: 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  selected?: boolean;
}

export function AnchorChip({
  anchor,
  size = 'sm',
  removable = false,
  onRemove,
  onClick,
  selected = false,
}: AnchorChipProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border transition-all',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        onClick && 'cursor-pointer hover:opacity-80',
        selected
          ? 'border-transparent'
          : 'border-border-default bg-bg-tertiary',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 focus-visible:ring-offset-bg-secondary'
      )}
      style={
        selected
          ? { backgroundColor: anchor.color, color: '#fff' }
          : { borderColor: anchor.color + '40' }
      }
    >
      <span>{anchor.icon}</span>
      <span className={cn(
        'font-medium',
        !selected && 'text-text-secondary'
      )}>
        {anchor.name}
      </span>
      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          className={cn(
            'ml-0.5 rounded-full p-0.5 transition-colors',
            'hover:bg-white/20',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
          )}
          aria-label={`Remove ${anchor.name}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
