CREATE TABLE IF NOT EXISTS "Log" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" text,
	"userId" text NOT NULL,
	"roomId" text NOT NULL,
	"scale" text,
	"votes" text,
	"roomName" text,
	"topicName" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Presence" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"userFullName" text NOT NULL,
	"userImageUrl" text NOT NULL,
	"isVIP" boolean DEFAULT false NOT NULL,
	"isAdmin" boolean DEFAULT false NOT NULL,
	"roomId" text NOT NULL,
	CONSTRAINT "Presence_userId_roomId_unique" UNIQUE("userId","roomId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Room" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" text,
	"userId" text NOT NULL,
	"roomName" text,
	"topicName" text,
	"visible" boolean DEFAULT false NOT NULL,
	"scale" text DEFAULT '0.5,1,2,3,5' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Vote" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" text,
	"userId" text NOT NULL,
	"roomId" text NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "Vote_userId_roomId_unique" UNIQUE("userId","roomId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Presence" ADD CONSTRAINT "Presence_roomId_Room_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Vote" ADD CONSTRAINT "Vote_roomId_Room_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_log_idx" ON "Log" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_vote_idx" ON "Vote" USING btree ("userId");