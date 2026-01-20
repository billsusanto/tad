import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getDb } from '@/lib/db';
import { tasks, streaks, taskAnchors, anchors } from '@/lib/db/schema';
import { eq, desc, and, gte, lt, inArray } from 'drizzle-orm';
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
      .orderBy(tasks.priority, desc(tasks.createdAt));

    const taskIds = userTasks.map((t) => t.id);
    
    const taskAnchorMap: Record<string, { id: string; name: string; icon: string; color: string }[]> = {};
    
    if (taskIds.length > 0) {
      const taskAnchorRows = await db
        .select({
          taskId: taskAnchors.taskId,
          anchorId: anchors.id,
          name: anchors.name,
          icon: anchors.icon,
          color: anchors.color,
        })
        .from(taskAnchors)
        .innerJoin(anchors, eq(taskAnchors.anchorId, anchors.id))
        .where(inArray(taskAnchors.taskId, taskIds));

      for (const row of taskAnchorRows) {
        if (!taskAnchorMap[row.taskId]) {
          taskAnchorMap[row.taskId] = [];
        }
        taskAnchorMap[row.taskId].push({
          id: row.anchorId,
          name: row.name,
          icon: row.icon,
          color: row.color,
        });
      }
    }

    const tasksWithAnchors = userTasks.map((task) => ({
      ...task,
      anchors: taskAnchorMap[task.id] || [],
    }));

    return NextResponse.json(tasksWithAnchors);
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
    const { title, description, priority, dueDate, dueTime, timeEstimate, anchorIds } = body;

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

    let taskAnchorList: { id: string; name: string; icon: string; color: string }[] = [];

    if (anchorIds && Array.isArray(anchorIds) && anchorIds.length > 0) {
      await db.insert(taskAnchors).values(
        anchorIds.map((anchorId: string) => ({
          taskId: newTask.id,
          anchorId,
        }))
      );

      const anchorRows = await db
        .select()
        .from(anchors)
        .where(inArray(anchors.id, anchorIds));

      taskAnchorList = anchorRows.map((a) => ({
        id: a.id,
        name: a.name,
        icon: a.icon,
        color: a.color,
      }));
    }

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

    return NextResponse.json({ ...newTask, anchors: taskAnchorList }, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
