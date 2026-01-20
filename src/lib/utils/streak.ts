import type { Streak } from '@/lib/db/schema';
import { 
  getTodayUTC, 
  toUTCMidnight, 
  isSameDayUTC, 
  addDaysUTC, 
  getStartOfWeekUTC,
  getDayOfWeekUTC 
} from './date';

export interface StreakData {
  currentStreak: number;
  consistencyRate: number;
  isOnFire: boolean;
  weeklyProgress: WeeklyDayStatus[];
  contributionData: ContributionDay[];
  thisWeekCompleted: number;
  thisWeekTotal: number;
}

export interface WeeklyDayStatus {
  date: Date;
  completed: boolean;
  isToday: boolean;
  tasksCount: number;
}

export interface ContributionDay {
  date: Date;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export type StreakTheme = 'github' | 'ocean' | 'sunset' | 'purple';

export const STREAK_THEMES: Record<StreakTheme, { color: string; name: string }> = {
  github: { color: '#22c55e', name: 'GitHub Green' },
  ocean: { color: '#0ea5e9', name: 'Ocean Blue' },
  sunset: { color: '#f97316', name: 'Sunset Orange' },
  purple: { color: '#a855f7', name: 'Purple' },
};

export function calculateCurrentStreak(streaks: Streak[]): number {
  if (streaks.length === 0) return 0;

  const sortedStreaks = [...streaks].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const today = getTodayUTC();
  const yesterday = addDaysUTC(today, -1);

  let streak = 0;
  let expectedDate = today;

  for (const record of sortedStreaks) {
    const recordDate = toUTCMidnight(new Date(record.date));

    if (record.tasksCompleted === 0) {
      if (isSameDayUTC(recordDate, today)) {
        expectedDate = yesterday;
        continue;
      }
      break;
    }

    if (isSameDayUTC(recordDate, expectedDate)) {
      streak++;
      expectedDate = addDaysUTC(expectedDate, -1);
    } else if (isSameDayUTC(recordDate, addDaysUTC(expectedDate, -1))) {
      expectedDate = recordDate;
      streak++;
      expectedDate = addDaysUTC(expectedDate, -1);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateConsistencyRate(streaks: Streak[], days: number = 7): number {
  if (streaks.length === 0) return 0;

  const today = getTodayUTC();
  const startDate = addDaysUTC(today, -(days - 1));

  let daysWithCompletions = 0;

  for (let i = 0; i < days; i++) {
    const checkDate = addDaysUTC(startDate, i);
    const hasCompletion = streaks.some(
      (s) =>
        isSameDayUTC(new Date(s.date), checkDate) && s.tasksCompleted > 0
    );
    if (hasCompletion) daysWithCompletions++;
  }

  return Math.round((daysWithCompletions / days) * 100);
}

export function isOnFire(consistencyRate: number): boolean {
  return consistencyRate >= 80;
}

export function getWeeklyProgress(streaks: Streak[]): WeeklyDayStatus[] {
  const today = getTodayUTC();
  const startOfWeekDate = getStartOfWeekUTC(today);
  const result: WeeklyDayStatus[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addDaysUTC(startOfWeekDate, i);
    const streakRecord = streaks.find((s) => isSameDayUTC(new Date(s.date), date));
    const tasksCount = streakRecord?.tasksCompleted ?? 0;

    result.push({
      date,
      completed: tasksCount > 0,
      isToday: isSameDayUTC(date, today),
      tasksCount,
    });
  }

  return result;
}

export function getContributionData(
  streaks: Streak[],
  weeks: number = 12
): ContributionDay[] {
  const today = getTodayUTC();
  const totalDays = weeks * 7;
  const startDate = addDaysUTC(today, -(totalDays - 1));
  const result: ContributionDay[] = [];

  for (let i = 0; i < totalDays; i++) {
    const date = addDaysUTC(startDate, i);
    const streakRecord = streaks.find((s) => isSameDayUTC(new Date(s.date), date));
    const completed = streakRecord?.tasksCompleted ?? 0;
    const total = streakRecord?.totalTasks ?? 0;

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (completed > 0 && total > 0) {
      const ratio = completed / total;
      if (ratio <= 0.25) level = 1;
      else if (ratio <= 0.5) level = 2;
      else if (ratio <= 0.75) level = 3;
      else level = 4;
    }

    result.push({ date, count: completed, level });
  }

  return result;
}

export function calculateStreakData(streaks: Streak[]): StreakData {
  const currentStreak = calculateCurrentStreak(streaks);
  const consistencyRate = calculateConsistencyRate(streaks);
  const weeklyProgress = getWeeklyProgress(streaks);
  const contributionData = getContributionData(streaks);

  const thisWeekCompleted = weeklyProgress.filter((d) => d.completed).length;
  const thisWeekTotal = 7;

  return {
    currentStreak,
    consistencyRate,
    isOnFire: isOnFire(consistencyRate),
    weeklyProgress,
    contributionData,
    thisWeekCompleted,
    thisWeekTotal,
  };
}

export function formatStreakDate(date: Date): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function getDayName(date: Date, short: boolean = true): string {
  const days = short
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[getDayOfWeekUTC(date)];
}
