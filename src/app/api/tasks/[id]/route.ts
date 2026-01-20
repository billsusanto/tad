import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getDb } from '@/lib/db';
import { tasks, streaks } from '@/lib/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';
import { getTodayUTC, addDaysUTC } from '@/lib/utils/date';

async function updateStreakRecord(userId: string, completedIncrement: number) {
  const db = getDb();
  const today = getTodayUTC();
  const tomorrow = addDaysUTC(today, 1);

  const [existingStreak] = await db
    .select()
    .from(streaks)
    .where(and(
      eq(streaks.userId, userId), 
      gte(streaks.date, today),
      lt(streaks.date, tomorrow)
    ))
    .limit(1);

  if (existingStreak) {
    const newCompleted = Math.max(0, existingStreak.tasksCompleted + completedIncrement);
    await db
      .update(streaks)
      .set({
        tasksCompleted: newCompleted,
        goalMet: newCompleted > 0,
      })
      .where(eq(streaks.id, existingStreak.id));
  } else if (completedIncrement > 0) {
    await db.insert(streaks).values({
      userId,
      date: today,
      tasksCompleted: completedIncrement,
      totalTasks: 1,
      goalMet: true,
    });
  }
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)));

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Failed to fetch task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, status, priority, dueDate, dueTime, timeEstimate, scheduledStart, scheduledEnd, isFixed } = body;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedAt = new Date();
      } else if (status === 'pending') {
        updateData.completedAt = null;
      } else if (status === 'archived') {
        updateData.archivedAt = new Date();
      }
    }
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (dueTime !== undefined) updateData.dueTime = dueTime;
    if (timeEstimate !== undefined) updateData.timeEstimate = timeEstimate;
    if (scheduledStart !== undefined) updateData.scheduledStart = scheduledStart;
    if (scheduledEnd !== undefined) updateData.scheduledEnd = scheduledEnd;
    if (isFixed !== undefined) updateData.isFixed = isFixed;

    const db = getDb();
    
    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)));

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const [updatedTask] = await db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))
      .returning();

    if (status !== undefined && status !== existingTask.status) {
      if (status === 'completed' && existingTask.status !== 'completed') {
        await updateStreakRecord(session.user.id, 1);
      } else if (existingTask.status === 'completed' && status !== 'completed') {
        await updateStreakRecord(session.user.id, -1);
      }
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const [deletedTask] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))
      .returning();

    if (!deletedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
