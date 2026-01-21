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

  const showPulseRing = currentStreak >= 7;
  const showFireGradient = isOnFire;

  return (
    <div
      className={cn(
        'relative p-6 rounded-2xl bg-gradient-card border border-border-default/50',
        showFireGradient && 'overflow-hidden',
        className
      )}
    >
      {showFireGradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 pointer-events-none" />
      )}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex items-center justify-center w-16 h-16 bg-bg-tertiary rounded-2xl',
              showPulseRing && 'animate-pulse-ring'
            )}
          >
            <span className="text-3xl" role="img" aria-label={isOnFire ? 'Fire emoji' : 'Calendar emoji'}>
              {isOnFire ? '🔥' : '📅'}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  'text-5xl font-bold tracking-tight',
                  showFireGradient ? 'text-gradient-fire' : 'text-text-primary'
                )}
              >
                {currentStreak}
              </span>
              <span className="text-base text-text-secondary">day{currentStreak !== 1 ? 's' : ''}</span>
            </div>
            <div className="text-sm text-text-secondary mt-1">consistency streak</div>
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
    </div>
  );
}
