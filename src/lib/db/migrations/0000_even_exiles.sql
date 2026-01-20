CREATE TABLE "accounts" (
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "anchors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"icon" text NOT NULL,
	"color" text NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"pattern" text NOT NULL,
	"frequency" integer DEFAULT 1,
	"days_of_week" text,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streaks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"tasks_completed" integer DEFAULT 0 NOT NULL,
	"total_tasks" integer DEFAULT 0 NOT NULL,
	"goal_met" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_anchors" (
	"task_id" uuid NOT NULL,
	"anchor_id" uuid NOT NULL,
	CONSTRAINT "task_anchors_task_id_anchor_id_pk" PRIMARY KEY("task_id","anchor_id")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" integer DEFAULT 4 NOT NULL,
	"due_date" timestamp,
	"due_time" text,
	"time_estimate" integer,
	"scheduled_start" text,
	"scheduled_end" text,
	"is_fixed" boolean DEFAULT false,
	"completed_at" timestamp,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"weekly_goal" integer DEFAULT 5 NOT NULL,
	"theme" text DEFAULT 'github' NOT NULL,
	"notifications_enabled" boolean DEFAULT true,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"has_completed_onboarding" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text,
	"email_verified" timestamp,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anchors" ADD CONSTRAINT "anchors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring" ADD CONSTRAINT "recurring_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_anchors" ADD CONSTRAINT "task_anchors_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_anchors" ADD CONSTRAINT "task_anchors_anchor_id_anchors_id_fk" FOREIGN KEY ("anchor_id") REFERENCES "public"."anchors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "streaks_user_id_date_idx" ON "streaks" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "tasks_user_id_status_idx" ON "tasks" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "tasks_user_id_due_date_idx" ON "tasks" USING btree ("user_id","due_date");