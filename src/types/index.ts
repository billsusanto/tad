import type { Task, Anchor, User, Streak, UserSettings } from '@/lib/db/schema';

export type { Task, Anchor, User, Streak, UserSettings };

export type {
  StreakData,
  WeeklyDayStatus,
  ContributionDay,
  StreakTheme,
} from '@/lib/utils/streak';

export type TaskStatus = 'pending' | 'completed' | 'archived';

export type TaskWithAnchors = Task & {
  anchors: Anchor[];
};

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: number;
  dueDate?: Date;
  dueTime?: string;
  timeEstimate?: number;
  anchorIds?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: number;
  dueDate?: Date | null;
  dueTime?: string | null;
  timeEstimate?: number | null;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
