'use client';

import { Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { TaskWithAnchors } from '@/types';

interface UnscheduledListProps {
  tasks: TaskWithAnchors[];
  onSchedule: (task: TaskWithAnchors) => void;
}

const timeEstimateLabels: Record<number, string> = {
  15: '15m',
  30: '30m',
  60: '1h',
  120: '2h+',
};

export function UnscheduledList({ tasks, onSchedule }: UnscheduledListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No unscheduled tasks</p>
        <p className="text-xs mt-1">All tasks have been scheduled!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <button
          key={task.id}
          onClick={() => onSchedule(task)}
          className={cn(
            'w-full flex items-start gap-3 p-3 rounded-lg',
            'bg-bg-secondary border border-border-default',
            'hover:border-border-hover transition-colors text-left',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
            task.status === 'completed' && 'opacity-50'
          )}
        >
          <span
            className={cn(
              'flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center',
              task.status === 'completed'
                ? 'bg-brand-primary border-brand-primary'
                : 'border-border-default'
            )}
          >
            {task.status === 'completed' && (
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
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'text-sm font-medium text-text-primary',
                task.status === 'completed' && 'line-through text-text-secondary'
              )}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {task.anchors?.slice(0, 2).map((anchor) => (
                <span
                  key={anchor.id}
                  className="inline-flex items-center gap-0.5 text-xs"
                  style={{ color: anchor.color }}
                >
                  <span>{anchor.icon}</span>
                </span>
              ))}
              {task.timeEstimate && (
                <span className="inline-flex items-center gap-0.5 text-xs text-text-muted">
                  <Clock className="h-3 w-3" />
                  {timeEstimateLabels[task.timeEstimate] || `${task.timeEstimate}m`}
                </span>
              )}
            </div>
          </div>
          <span className="text-xs text-brand-primary">+ Schedule</span>
        </button>
      ))}
    </div>
  );
}
