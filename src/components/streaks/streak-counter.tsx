'use client';

import { cn } from '@/lib/utils/cn';

interface StreakCounterProps {
  currentStreak: number;
  consistencyRate: number;
  isOnFire: boolean;
  className?: string;
}

export function StreakCounter({
  currentStreak,
  consistencyRate,
  isOnFire,
  className,
}: StreakCounterProps) {
  const statusText = isOnFire ? 'On Fire!' : consistencyRate >= 50 ? 'On Track' : 'Keep Going';
  const statusColor = isOnFire
    ? 'text-warning'
    : consistencyRate >= 50
    ? 'text-success'
    : 'text-text-secondary';

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 bg-bg-secondary rounded-lg border border-border-default',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-bg-tertiary rounded-lg">
          <span className="text-2xl" role="img" aria-label={isOnFire ? 'Fire emoji' : 'Calendar emoji'}>
            {isOnFire ? '🔥' : '📅'}
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-text-primary">{currentStreak}</span>
            <span className="text-sm text-text-secondary">day{currentStreak !== 1 ? 's' : ''}</span>
          </div>
          <div className="text-sm text-text-secondary">consistency streak</div>
        </div>
      </div>

      <div className="text-right">
        <div className={cn('text-lg font-semibold', statusColor)}>
          {statusText}
        </div>
        <div className="text-sm text-text-secondary">
          {consistencyRate}% this week
        </div>
      </div>
    </div>
  );
}
