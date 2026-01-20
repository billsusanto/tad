'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { TaskWithAnchors } from '@/types';

interface TaskItemProps {
  task: TaskWithAnchors;
  onToggle: (id: string) => void;
}

const timeEstimateLabels: Record<number, string> = {
  15: '15m',
  30: '30m',
  60: '1h',
  120: '2h+',
};

const priorityConfig: Record<number, { label: string; color: string }> = {
  1: { label: 'P1', color: '#ef4444' },
  2: { label: 'P2', color: '#f97316' },
  3: { label: 'P3', color: '#3b82f6' },
  4: { label: 'P4', color: '#6b7280' },
};

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const isCompleted = task.status === 'completed';
  const hasMetadata = task.timeEstimate || task.dueTime || task.anchors?.length > 0 || task.priority < 4;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl bg-bg-secondary border border-border-default',
        'transition-all duration-200',
        'hover:border-border-hover',
        isCompleted && 'opacity-60'
      )}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          'flex-shrink-0 h-11 w-11 -ml-3 -my-3 rounded-lg transition-all duration-150',
          'flex items-center justify-center',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary'
        )}
        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      >
        <span
          className={cn(
            'h-5 w-5 rounded border-2 flex items-center justify-center transition-all duration-150',
            isCompleted
              ? 'bg-brand-primary border-brand-primary'
              : 'bg-transparent border-border-default group-hover:border-brand-primary/50'
          )}
        >
          {isCompleted && (
            <svg
              className="h-3 w-3 text-bg-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium text-text-primary',
            isCompleted && 'line-through text-text-secondary'
          )}
        >
          {task.title}
        </p>
        
        {hasMetadata && (
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {task.anchors?.map((anchor) => (
              <span
                key={anchor.id}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
                style={{ backgroundColor: anchor.color + '20', color: anchor.color }}
              >
                <span>{anchor.icon}</span>
                <span className="font-medium">{anchor.name}</span>
              </span>
            ))}
            {task.priority < 4 && (
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold"
                style={{ 
                  backgroundColor: priorityConfig[task.priority].color + '20',
                  color: priorityConfig[task.priority].color 
                }}
              >
                {priorityConfig[task.priority].label}
              </span>
            )}
            {task.timeEstimate && (
              <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                <Clock className="h-3 w-3" />
                {timeEstimateLabels[task.timeEstimate] || `${task.timeEstimate}m`}
              </span>
            )}
            {task.dueTime && (
              <span className="text-xs text-text-muted">
                {task.dueTime}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
