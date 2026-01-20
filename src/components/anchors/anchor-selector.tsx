'use client';

import { useState } from 'react';
import { Tag, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Anchor } from '@/types';

interface AnchorSelectorProps {
  anchors: Anchor[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  loading?: boolean;
}

export function AnchorSelector({
  anchors,
  selectedIds,
  onChange,
  loading = false,
}: AnchorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAnchor = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedAnchors = anchors.filter((a) => selectedIds.includes(a.id));

  if (loading) {
    return (
      <div className="h-9 w-16 bg-bg-tertiary rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
          'bg-bg-tertiary transition-colors',
          selectedIds.length > 0
            ? 'text-text-primary'
            : 'text-text-secondary hover:text-text-primary'
        )}
      >
        <Tag className="h-4 w-4" />
        {selectedIds.length > 0 ? (
          <span className="flex items-center gap-1">
            {selectedAnchors.slice(0, 2).map((a) => (
              <span key={a.id}>{a.icon}</span>
            ))}
            {selectedAnchors.length > 2 && (
              <span className="text-xs text-text-muted">
                +{selectedAnchors.length - 2}
              </span>
            )}
          </span>
        ) : (
          'Tag'
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={cn(
              'absolute left-0 top-full mt-2 z-50',
              'min-w-[200px] p-2 rounded-xl',
              'bg-bg-secondary border border-border-default shadow-xl'
            )}
          >
            {anchors.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-text-secondary">No anchors yet</p>
                <p className="text-xs text-text-muted mt-1">
                  Create anchors in Settings
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {anchors.map((anchor) => {
                  const isSelected = selectedIds.includes(anchor.id);
                  return (
                    <button
                      key={anchor.id}
                      type="button"
                      onClick={() => toggleAnchor(anchor.id)}
                      className={cn(
                        'flex items-center gap-2 w-full px-3 py-2 rounded-lg',
                        'text-sm transition-colors',
                        isSelected
                          ? 'bg-bg-tertiary text-text-primary'
                          : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                      )}
                    >
                      <span>{anchor.icon}</span>
                      <span className="flex-1 text-left">{anchor.name}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-brand-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
