'use client';

import { useStreak } from '@/hooks/use-streak';
import { ContributionGraph, StreakCounter, WeeklyProgress } from '@/components/streaks';
import { StatsSkeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import type { ContributionDay, WeeklyDayStatus } from '@/lib/utils/streak';

function parseWeeklyProgress(data: { date: string; completed: boolean; isToday: boolean; tasksCount: number }[]): WeeklyDayStatus[] {
  return data.map((day) => ({
    ...day,
    date: new Date(day.date),
  }));
}

function parseContributionData(data: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[]): ContributionDay[] {
  return data.map((day) => ({
    ...day,
    date: new Date(day.date),
  }));
}

export default function StatsPage() {
  const { data, loading, error, theme, setTheme, refetch } = useStreak();

  if (loading) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Statistics</h1>
        <StatsSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Statistics</h1>
        <ErrorState
          title="Failed to load stats"
          message={error || 'We couldn\'t load your statistics. Please try again.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const weeklyProgress = parseWeeklyProgress(data.weeklyProgress);
  const contributionData = parseContributionData(data.contributionData);

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary">Statistics</h1>

      <StreakCounter
        currentStreak={data.currentStreak}
        consistencyRate={data.consistencyRate}
        isOnFire={data.isOnFire}
      />

      <WeeklyProgress progress={weeklyProgress} />

      <div className="p-4 bg-bg-secondary rounded-lg border border-border-default">
        <h2 className="text-sm font-medium text-text-primary mb-4">Activity</h2>
        <ContributionGraph
          data={contributionData}
          theme={theme}
          onThemeChange={setTheme}
          showThemeSelector
        />
      </div>

      <div className="p-4 bg-bg-secondary rounded-lg border border-border-default">
        <h2 className="text-sm font-medium text-text-primary mb-3">This Week Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-text-primary">
              {data.thisWeekCompleted}
            </div>
            <div className="text-sm text-text-secondary">Days completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">
              {data.consistencyRate}%
            </div>
            <div className="text-sm text-text-secondary">Consistency rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
