import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getDb } from '@/lib/db';
import { userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id));

    if (!settings) {
      const [newSettings] = await db
        .insert(userSettings)
        .values({
          userId: session.user.id,
        })
        .returning();
      return NextResponse.json(newSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weeklyGoal, theme, notificationsEnabled, timezone, hasCompletedOnboarding } = body;

    const db = getDb();
    
    const [existingSettings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id));

    if (!existingSettings) {
      const [newSettings] = await db
        .insert(userSettings)
        .values({
          userId: session.user.id,
          weeklyGoal: weeklyGoal ?? 5,
          theme: theme ?? 'github',
          notificationsEnabled: notificationsEnabled ?? true,
          timezone: timezone ?? 'UTC',
          hasCompletedOnboarding: hasCompletedOnboarding ?? false,
        })
        .returning();
      return NextResponse.json(newSettings);
    }

    const [updatedSettings] = await db
      .update(userSettings)
      .set({
        weeklyGoal: weeklyGoal ?? existingSettings.weeklyGoal,
        theme: theme ?? existingSettings.theme,
        notificationsEnabled: notificationsEnabled ?? existingSettings.notificationsEnabled,
        timezone: timezone ?? existingSettings.timezone,
        hasCompletedOnboarding: hasCompletedOnboarding ?? existingSettings.hasCompletedOnboarding,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, session.user.id))
      .returning();

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
