import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getDb } from '@/lib/db';
import { anchors } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const [anchor] = await db
      .select()
      .from(anchors)
      .where(and(eq(anchors.id, id), eq(anchors.userId, session.user.id)));

    if (!anchor) {
      return NextResponse.json({ error: 'Anchor not found' }, { status: 404 });
    }

    return NextResponse.json(anchor);
  } catch (error) {
    console.error('Failed to fetch anchor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anchor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, icon, color } = body;

    const db = getDb();
    const [existingAnchor] = await db
      .select()
      .from(anchors)
      .where(and(eq(anchors.id, id), eq(anchors.userId, session.user.id)));

    if (!existingAnchor) {
      return NextResponse.json({ error: 'Anchor not found' }, { status: 404 });
    }

    const [updatedAnchor] = await db
      .update(anchors)
      .set({
        name: name ?? existingAnchor.name,
        icon: icon ?? existingAnchor.icon,
        color: color ?? existingAnchor.color,
      })
      .where(eq(anchors.id, id))
      .returning();

    return NextResponse.json(updatedAnchor);
  } catch (error) {
    console.error('Failed to update anchor:', error);
    return NextResponse.json(
      { error: 'Failed to update anchor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const [existingAnchor] = await db
      .select()
      .from(anchors)
      .where(and(eq(anchors.id, id), eq(anchors.userId, session.user.id)));

    if (!existingAnchor) {
      return NextResponse.json({ error: 'Anchor not found' }, { status: 404 });
    }

    await db.delete(anchors).where(eq(anchors.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete anchor:', error);
    return NextResponse.json(
      { error: 'Failed to delete anchor' },
      { status: 500 }
    );
  }
}
