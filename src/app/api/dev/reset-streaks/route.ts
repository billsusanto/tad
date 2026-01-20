import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getDb } from '@/lib/db';
import { streaks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    await db.delete(streaks).where(eq(streaks.userId, session.user.id));

    return NextResponse.json({ success: true, message: 'Streaks reset' });
  } catch (error) {
    console.error('Failed to reset streaks:', error);
    return NextResponse.json({ error: 'Failed to reset' }, { status: 500 });
  }
}
