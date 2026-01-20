'use client';

import { useState, useCallback, useEffect } from 'react';
import type { StreakTheme } from '@/lib/utils/streak';

interface WeeklyDayStatus {
  date: string;
  completed: boolean;
  isToday: boolean;
  tasksCount: number;
}

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface StreakData {
  currentStreak: number;
  consistencyRate: number;
  isOnFire: boolean;
  weeklyProgress: WeeklyDayStatus[];
  contributionData: ContributionDay[];
  thisWeekCompleted: number;
  thisWeekTotal: number;
}

interface UseStreakReturn {
  data: StreakData | null;
  loading: boolean;
  error: string | null;
  theme: StreakTheme;
  setTheme: (theme: StreakTheme) => void;
  refetch: () => Promise<void>;
}

const DEFAULT_STREAK_DATA: StreakData = {
  currentStreak: 0,
  consistencyRate: 0,
  isOnFire: false,
  weeklyProgress: [],
  contributionData: [],
  thisWeekCompleted: 0,
  thisWeekTotal: 7,
};

export function useStreak(): UseStreakReturn {
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<StreakTheme>('github');

  useEffect(() => {
    const savedTheme = localStorage.getItem('streak-theme');
    if (savedTheme && ['github', 'ocean', 'sunset', 'purple'].includes(savedTheme)) {
      setTheme(savedTheme as StreakTheme);
    }
  }, []);

  const handleSetTheme = useCallback((newTheme: StreakTheme) => {
    setTheme(newTheme);
    localStorage.setItem('streak-theme', newTheme);
  }, []);

  const fetchStreakData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/streaks');
      if (!response.ok) {
        throw new Error('Failed to fetch streak data');
      }
      const streakData = await response.json();
      setData(streakData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch streak data');
      setData(DEFAULT_STREAK_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreakData();
  }, [fetchStreakData]);

  return {
    data,
    loading,
    error,
    theme,
    setTheme: handleSetTheme,
    refetch: fetchStreakData,
  };
}
