import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', { enum: ['pending', 'completed', 'archived'] })
      .default('pending')
      .notNull(),
    priority: integer('priority').default(4).notNull(),
    dueDate: timestamp('due_date', { mode: 'date' }),
    dueTime: text('due_time'),
    timeEstimate: integer('time_estimate'),
    scheduledStart: text('scheduled_start'),
    scheduledEnd: text('scheduled_end'),
    isFixed: boolean('is_fixed').default(false),
    completedAt: timestamp('completed_at'),
    archivedAt: timestamp('archived_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('tasks_user_id_status_idx').on(table.userId, table.status),
    index('tasks_user_id_due_date_idx').on(table.userId, table.dueDate),
  ]
);

export const anchors = pgTable('anchors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const taskAnchors = pgTable(
  'task_anchors',
  {
    taskId: uuid('task_id')
      .references(() => tasks.id, { onDelete: 'cascade' })
      .notNull(),
    anchorId: uuid('anchor_id')
      .references(() => anchors.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.taskId, table.anchorId] })]
);

export const recurring = pgTable('recurring', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id')
    .references(() => tasks.id, { onDelete: 'cascade' })
    .notNull(),
  pattern: text('pattern', { enum: ['daily', 'weekly', 'custom'] }).notNull(),
  frequency: integer('frequency').default(1),
  daysOfWeek: text('days_of_week'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const streaks = pgTable(
  'streaks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    date: timestamp('date', { mode: 'date' }).notNull(),
    tasksCompleted: integer('tasks_completed').default(0).notNull(),
    totalTasks: integer('total_tasks').default(0).notNull(),
    goalMet: boolean('goal_met').default(false).notNull(),
  },
  (table) => [index('streaks_user_id_date_idx').on(table.userId, table.date)]
);

export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .primaryKey(),
  weeklyGoal: integer('weekly_goal').default(5).notNull(),
  theme: text('theme').default('github').notNull(),
  notificationsEnabled: boolean('notifications_enabled').default(true),
  timezone: text('timezone').default('UTC').notNull(),
  hasCompletedOnboarding: boolean('has_completed_onboarding').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Anchor = typeof anchors.$inferSelect;
export type Streak = typeof streaks.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
