import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getDb } from '@/lib/db';
import { streaks, tasks } from '@/lib/db/schema';
import { eq, and, gte, lt, desc, count } from 'drizzle-orm';
import { calculateStreakData } from '@/lib/utils/streak';
import { getTodayUTC, addDaysUTC } from '@/lib/utils/date';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    threeMonthsAgo.setHours(0, 0, 0, 0);

    const streakRecords = await db
      .select()
      .from(streaks)
      .where(
        and(
          eq(streaks.userId, session.user.id),
          gte(streaks.date, threeMonthsAgo)
        )
      )
      .orderBy(desc(streaks.date));

    const today = getTodayUTC();
    const tomorrow = addDaysUTC(today, 1);
    
    const [todayTaskCount] = await db
      .select({ count: count() })
      .from(tasks)
      .where(and(
        eq(tasks.userId, session.user.id),
        gte(tasks.createdAt, today),
        lt(tasks.createdAt, tomorrow)
      ));

    const enrichedRecords = streakRecords.map(record => {
      const recordDate = new Date(record.date);
      if (recordDate.getTime() === today.getTime()) {
        return { ...record, totalTasks: todayTaskCount?.count ?? record.totalTasks };
      }
      return record;
    });

    const streakData = calculateStreakData(enrichedRecords);

    return NextResponse.json({
      ...streakData,
      weeklyProgress: streakData.weeklyProgress.map((day) => ({
        ...day,
        date: day.date.toISOString(),
      })),
      contributionData: streakData.contributionData.map((day) => ({
        ...day,
        date: day.date.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Failed to fetch streak data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streak data' },
      { status: 500 }
    );
  }
}
