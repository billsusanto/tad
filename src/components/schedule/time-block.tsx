'use client';

import { Lock, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { TaskWithAnchors } from '@/types';

interface TimeBlockProps {
  task: TaskWithAnchors;
  startTime: string;
  endTime: string;
  isFixed?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function getDurationMinutes(start: string, end: string): number {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  return (endH * 60 + endM) - (startH * 60 + startM);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function TimeBlock({
  task,
  startTime,
  endTime,
  isFixed = false,
  onClick,
  style,
}: TimeBlockProps) {
  const duration = getDurationMinutes(startTime, endTime);
  const isCompleted = task.status === 'completed';
  const primaryAnchor = task.anchors?.[0];

  return (
    <button
      onClick={onClick}
      style={style}
      className={cn(
        'absolute left-16 right-2 rounded-lg p-2 text-left transition-all',
        'border-l-4 overflow-hidden',
        isFixed
          ? 'bg-amber-500/10 border-amber-500 hover:bg-amber-500/20'
          : 'bg-brand-primary/10 border-brand-primary hover:bg-brand-primary/20',
        isCompleted && 'opacity-50',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {isFixed && <Lock className="h-3 w-3 text-amber-500 flex-shrink-0" />}
            <span
              className={cn(
                'text-sm font-medium text-text-primary truncate',
                isCompleted && 'line-through text-text-secondary'
              )}
            >
              {task.title}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-text-muted">
              {formatTime(startTime)} - {formatTime(endTime)}
            </span>
            <span className="text-xs text-text-muted flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {formatDuration(duration)}
            </span>
          </div>
        </div>
        {primaryAnchor && (
          <span
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs flex-shrink-0"
            style={{ backgroundColor: primaryAnchor.color + '20', color: primaryAnchor.color }}
          >
            <span>{primaryAnchor.icon}</span>
          </span>
        )}
      </div>
    </button>
  );
}
