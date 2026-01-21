'use client';

import { cn } from '@/lib/utils/cn';
import type { WeeklyDayStatus } from '@/lib/utils/streak';
import { getDayName } from '@/lib/utils/streak';

interface WeeklyProgressProps {
  progress: WeeklyDayStatus[];
  className?: string;
}

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function WeeklyProgress({ progress, className }: WeeklyProgressProps) {
  const completedDays = progress.filter((d) => d.completed).length;
  const consistencyPercentage = Math.round((completedDays / 7) * 100);

  return (
    <div className={cn('p-5 rounded-2xl bg-gradient-card border border-border-default/50', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-primary">This Week</h3>
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-text-primary">{completedDays}</span>
          <span className="text-sm text-text-secondary">/ 7 days</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1.5">
        {progress.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-text-muted">{DAY_LETTERS[index]}</span>
            <div
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center transition-all',
                day.completed
                  ? 'bg-brand-primary text-bg-primary shadow-lg glow-brand'
                  : 'bg-bg-tertiary text-text-muted',
                day.isToday && !day.completed && 'ring-2 ring-brand-primary/50 animate-pulse'
              )}
              role="status"
              aria-label={`${getDayName(new Date(day.date))}: ${day.tasksCount} task${day.tasksCount !== 1 ? 's' : ''} completed${day.isToday ? ' (today)' : ''}`}
            >
              {day.completed ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : day.isToday ? (
                <span className="text-xs font-medium text-text-secondary">...</span>
              ) : null}
            </div>
            {day.tasksCount > 0 && (
              <span className="text-xs text-text-secondary">{day.tasksCount}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border-default/50">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text-secondary">Consistency</span>
          <span className={cn(
            'font-medium',
            completedDays >= 5 ? 'text-success' : completedDays >= 3 ? 'text-warning' : 'text-text-secondary'
          )}>
            {consistencyPercentage}%
          </span>
        </div>
        <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              completedDays >= 5 ? 'bg-brand-primary' : completedDays >= 3 ? 'bg-warning' : 'bg-text-muted'
            )}
            style={{ width: `${consistencyPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
