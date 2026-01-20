'use client';

import { useStreak } from '@/hooks/use-streak';
import { ContributionGraph, StreakCounter, WeeklyProgress } from '@/components/streaks';
import type { ContributionDay, WeeklyDayStatus } from '@/lib/utils/streak';

function StatsLoading() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="h-24 bg-bg-secondary rounded-lg" />
      <div className="h-32 bg-bg-secondary rounded-lg" />
      <div className="h-48 bg-bg-secondary rounded-lg" />
    </div>
  );
}

function StatsError({ message }: { message: string }) {
  return (
    <div className="p-4">
      <div className="p-4 bg-bg-secondary rounded-lg border border-error/30 text-center">
        <p className="text-error">{message}</p>
        <p className="text-text-secondary text-sm mt-2">
          Please try refreshing the page.
        </p>
      </div>
    </div>
  );
}

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
  const { data, loading, error, theme, setTheme } = useStreak();

  if (loading) {
    return <StatsLoading />;
  }

  if (error || !data) {
    return <StatsError message={error || 'Failed to load stats'} />;
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
