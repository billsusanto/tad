import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getDb } from '@/lib/db';
import { tasks, taskAnchors, anchors } from '@/lib/db/schema';
import { eq, and, gte, lt, inArray, or, isNotNull } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    
    if (!dateStr) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const db = getDb();
    
    const userTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, session.user.id),
          or(
            and(
              gte(tasks.dueDate, targetDate),
              lt(tasks.dueDate, nextDate)
            ),
            isNotNull(tasks.scheduledStart)
          )
        )
      );

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

    const scheduled = tasksWithAnchors.filter(
      (t) => t.scheduledStart && t.scheduledEnd && t.status !== 'archived'
    );
    
    const unscheduled = tasksWithAnchors.filter(
      (t) => (!t.scheduledStart || !t.scheduledEnd) && t.status !== 'archived'
    );

    return NextResponse.json({
      scheduled,
      unscheduled,
      date: targetDate.toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}
