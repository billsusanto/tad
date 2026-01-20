'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
}

const timeEstimateLabels: Record<number, string> = {
  15: '15m',
  30: '30m',
  60: '1h',
  120: '2h+',
};

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const isCompleted = task.status === 'completed';

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
          'flex-shrink-0 h-5 w-5 mt-0.5 rounded border-2 transition-all duration-150',
          'flex items-center justify-center',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary',
          isCompleted
            ? 'bg-brand-primary border-brand-primary'
            : 'bg-transparent border-border-default hover:border-brand-primary/50'
        )}
        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
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
        
        {(task.timeEstimate || task.dueTime) && (
          <div className="flex items-center gap-2 mt-1.5">
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
