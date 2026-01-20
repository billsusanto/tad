import type { Streak } from '@/lib/db/schema';

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

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return startOfDay(date1).getTime() === startOfDay(date2).getTime();
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getDayOfWeek(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

function getStartOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const dayOfWeek = getDayOfWeek(d);
  d.setDate(d.getDate() - dayOfWeek);
  return d;
}

export function calculateCurrentStreak(streaks: Streak[]): number {
  if (streaks.length === 0) return 0;

  const sortedStreaks = [...streaks].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const today = startOfDay(new Date());
  const yesterday = addDays(today, -1);

  let streak = 0;
  let expectedDate = today;

  for (const record of sortedStreaks) {
    const recordDate = startOfDay(new Date(record.date));

    if (record.tasksCompleted === 0) {
      if (isSameDay(recordDate, today)) {
        expectedDate = yesterday;
        continue;
      }
      break;
    }

    if (isSameDay(recordDate, expectedDate)) {
      streak++;
      expectedDate = addDays(expectedDate, -1);
    } else if (isSameDay(recordDate, addDays(expectedDate, -1))) {
      expectedDate = recordDate;
      streak++;
      expectedDate = addDays(expectedDate, -1);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateConsistencyRate(streaks: Streak[], days: number = 7): number {
  if (streaks.length === 0) return 0;

  const today = startOfDay(new Date());
  const startDate = addDays(today, -(days - 1));

  let daysWithCompletions = 0;

  for (let i = 0; i < days; i++) {
    const checkDate = addDays(startDate, i);
    const hasCompletion = streaks.some(
      (s) =>
        isSameDay(new Date(s.date), checkDate) && s.tasksCompleted > 0
    );
    if (hasCompletion) daysWithCompletions++;
  }

  return Math.round((daysWithCompletions / days) * 100);
}

export function isOnFire(consistencyRate: number): boolean {
  return consistencyRate >= 80;
}

export function getWeeklyProgress(streaks: Streak[]): WeeklyDayStatus[] {
  const today = startOfDay(new Date());
  const startOfWeekDate = getStartOfWeek(today);
  const result: WeeklyDayStatus[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(startOfWeekDate, i);
    const streakRecord = streaks.find((s) => isSameDay(new Date(s.date), date));
    const tasksCount = streakRecord?.tasksCompleted ?? 0;

    result.push({
      date,
      completed: tasksCount > 0,
      isToday: isSameDay(date, today),
      tasksCount,
    });
  }

  return result;
}

export function getContributionData(
  streaks: Streak[],
  weeks: number = 12
): ContributionDay[] {
  const today = startOfDay(new Date());
  const totalDays = weeks * 7;
  const startDate = addDays(today, -(totalDays - 1));
  const result: ContributionDay[] = [];

  const maxCount = Math.max(...streaks.map((s) => s.tasksCompleted), 1);

  for (let i = 0; i < totalDays; i++) {
    const date = addDays(startDate, i);
    const streakRecord = streaks.find((s) => isSameDay(new Date(s.date), date));
    const count = streakRecord?.tasksCompleted ?? 0;

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 0) {
      const ratio = count / maxCount;
      if (ratio <= 0.25) level = 1;
      else if (ratio <= 0.5) level = 2;
      else if (ratio <= 0.75) level = 3;
      else level = 4;
    }

    result.push({ date, count, level });
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
  return days[getDayOfWeek(date)];
}
