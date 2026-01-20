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
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
        'whitespace-nowrap flex-shrink-0 transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
        selected
          ? 'text-white shadow-md'
          : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
      )}
      style={
        selected
          ? { backgroundColor: color || '#22c55e' }
          : undefined
      }
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
