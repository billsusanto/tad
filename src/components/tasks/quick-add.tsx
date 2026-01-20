'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnchorSelector } from '@/components/anchors/anchor-selector';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils/cn';
import { taskEvents } from '@/lib/events';
import type { Anchor } from '@/types';

interface QuickAddProps {
  open: boolean;
  onClose: () => void;
  onAdd?: () => void;
  anchors: Anchor[];
  anchorsLoading?: boolean;
}

const timeOptions = [
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 60, label: '1h' },
  { value: 120, label: '2h+' },
];

const priorityOptions = [
  { value: 1, label: 'P1', color: '#ef4444' },
  { value: 2, label: 'P2', color: '#f97316' },
  { value: 3, label: 'P3', color: '#3b82f6' },
  { value: 4, label: 'P4', color: '#6b7280' },
];

export function QuickAdd({ open, onClose, onAdd, anchors, anchorsLoading }: QuickAddProps) {
  const [title, setTitle] = useState('');
  const [timeEstimate, setTimeEstimate] = useState<number | null>(null);
  const [priority, setPriority] = useState<number>(4);
  const [selectedAnchorIds, setSelectedAnchorIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setTitle('');
      setTimeEstimate(null);
      setPriority(4);
      setSelectedAnchorIds([]);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          timeEstimate,
          priority,
          anchorIds: selectedAnchorIds.length > 0 ? selectedAnchorIds : undefined,
        }),
      });

      if (response.ok) {
        setTitle('');
        setTimeEstimate(null);
        setPriority(4);
        setSelectedAnchorIds([]);
        onClose();
        taskEvents.emit();
        onAdd?.();
        addToast('success', 'Task created');
      } else {
        addToast('error', 'Failed to create task');
      }
    } catch {
      addToast('error', 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-text-secondary mb-2">
            What do you want to actually do?
          </p>
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            autoComplete="off"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <QuickButton icon={Calendar} label="Due" disabled />
          
          <div className="flex gap-1">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTimeEstimate(
                  timeEstimate === option.value ? null : option.value
                )}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  timeEstimate === option.value
                    ? 'bg-brand-primary text-bg-primary'
                    : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <AnchorSelector
            anchors={anchors}
            selectedIds={selectedAnchorIds}
            onChange={setSelectedAnchorIds}
            loading={anchorsLoading}
          />
        </div>

        <div>
          <p className="text-xs text-text-muted mb-2">Priority</p>
          <div className="flex gap-1">
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPriority(option.value)}
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
                  priority === option.value
                    ? 'text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                )}
                style={
                  priority === option.value
                    ? { backgroundColor: option.color }
                    : undefined
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!title.trim()}
            className="flex-1"
          >
            Add Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function QuickButton({
  icon: Icon,
  label,
  disabled,
}: {
  icon: typeof Calendar;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
        'bg-bg-tertiary text-text-secondary',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:text-text-primary transition-colors'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
