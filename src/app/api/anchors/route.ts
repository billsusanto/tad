import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getDb } from '@/lib/db';
import { anchors } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const DEFAULT_ANCHORS = [
  { name: 'Home', icon: '🏠', color: '#22c55e' },
  { name: 'Work', icon: '💼', color: '#3b82f6' },
  { name: 'Health', icon: '🏃', color: '#f97316' },
  { name: 'Learning', icon: '📚', color: '#a855f7' },
];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const userAnchors = await db
      .select()
      .from(anchors)
      .where(eq(anchors.userId, session.user.id))
      .orderBy(anchors.createdAt);

    return NextResponse.json(userAnchors);
  } catch (error) {
    console.error('Failed to fetch anchors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anchors' },
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
    const { name, icon, color, createDefaults } = body;

    const db = getDb();

    if (createDefaults) {
      const existingAnchors = await db
        .select()
        .from(anchors)
        .where(eq(anchors.userId, session.user.id))
        .limit(1);

      if (existingAnchors.length === 0) {
        const newAnchors = await db
          .insert(anchors)
          .values(
            DEFAULT_ANCHORS.map((a) => ({
              userId: session.user.id,
              name: a.name,
              icon: a.icon,
              color: a.color,
              isDefault: true,
            }))
          )
          .returning();

        return NextResponse.json(newAnchors, { status: 201 });
      }
      
      return NextResponse.json([], { status: 200 });
    }

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const [newAnchor] = await db
      .insert(anchors)
      .values({
        userId: session.user.id,
        name: name.trim(),
        icon: icon || '🏷️',
        color: color || '#6b7280',
        isDefault: false,
      })
      .returning();

    return NextResponse.json(newAnchor, { status: 201 });
  } catch (error) {
    console.error('Failed to create anchor:', error);
    return NextResponse.json(
      { error: 'Failed to create anchor' },
      { status: 500 }
    );
  }
}
