import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getDb } from '@/lib/db';
import { tasks, streaks } from '@/lib/db/schema';
import { eq, desc, and, gte, lt } from 'drizzle-orm';
import { getTodayUTC, addDaysUTC } from '@/lib/utils/date';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, session.user.id))
      .orderBy(desc(tasks.createdAt));

    return NextResponse.json(userTasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, dueDate, dueTime, timeEstimate } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const [newTask] = await db
      .insert(tasks)
      .values({
        userId: session.user.id,
        title: title.trim(),
        description: description || null,
        priority: priority || 4,
        dueDate: dueDate ? new Date(dueDate) : null,
        dueTime: dueTime || null,
        timeEstimate: timeEstimate || null,
      })
      .returning();

    const today = getTodayUTC();
    const tomorrow = addDaysUTC(today, 1);
    
    const [existingStreak] = await db
      .select()
      .from(streaks)
      .where(and(
        eq(streaks.userId, session.user.id), 
        gte(streaks.date, today),
        lt(streaks.date, tomorrow)
      ))
      .limit(1);

    if (existingStreak) {
      await db
        .update(streaks)
        .set({ totalTasks: existingStreak.totalTasks + 1 })
        .where(eq(streaks.id, existingStreak.id));
    } else {
      await db.insert(streaks).values({
        userId: session.user.id,
        date: today,
        tasksCompleted: 0,
        totalTasks: 1,
        goalMet: false,
      });
    }

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
