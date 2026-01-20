import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getDb } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

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

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
