import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getDb } from '@/lib/db';
import { streaks } from '@/lib/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import { calculateStreakData } from '@/lib/utils/streak';

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

    const streakData = calculateStreakData(streakRecords);

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
