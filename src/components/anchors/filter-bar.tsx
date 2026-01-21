'use client';

import { cn } from '@/lib/utils/cn';
import type { Anchor } from '@/types';

interface FilterBarProps {
  anchors: Anchor[];
  selectedAnchorId: string | null;
  onSelect: (id: string | null) => void;
  loading?: boolean;
}

export function FilterBar({
  anchors,
  selectedAnchorId,
  onSelect,
  loading = false,
}: FilterBarProps) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <div className="h-8 w-12 bg-bg-tertiary rounded-full animate-pulse flex-shrink-0" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 w-20 bg-bg-tertiary rounded-full animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative -mx-4 px-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <FilterChip
          label="All"
          selected={selectedAnchorId === null}
          onClick={() => onSelect(null)}
        />
        {anchors.map((anchor) => (
          <FilterChip
            key={anchor.id}
            icon={anchor.icon}
            label={anchor.name}
            color={anchor.color}
            selected={selectedAnchorId === anchor.id}
            onClick={() => onSelect(anchor.id)}
          />
        ))}
      </div>
      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-bg-primary to-transparent pointer-events-none" />
    </div>
  );
}

interface FilterChipProps {
  icon?: string;
  label: string;
  color?: string;
  selected: boolean;
  onClick: () => void;
}

function FilterChip({ icon, label, color, selected, onClick }: FilterChipProps) {
  const selectedColor = color || '#22c55e';
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium',
        'whitespace-nowrap flex-shrink-0 transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
        selected
          ? 'text-white'
          : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
      )}
      style={
        selected
          ? { 
              backgroundColor: selectedColor,
              boxShadow: `0 4px 14px ${selectedColor}40`
            }
          : undefined
      }
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
