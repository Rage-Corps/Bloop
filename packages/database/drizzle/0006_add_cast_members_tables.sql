-- Create cast_members table
CREATE TABLE IF NOT EXISTS "cast_members" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now()
);--> statement-breakpoint

-- Create media_cast junction table
CREATE TABLE IF NOT EXISTS "media_cast" (
	"id" text PRIMARY KEY NOT NULL,
	"media_id" text NOT NULL,
	"cast_member_id" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);--> statement-breakpoint

-- Add raw_description_div column to media table
ALTER TABLE "media" ADD COLUMN "raw_description_div" text;--> statement-breakpoint

-- Drop cast column from media table
ALTER TABLE "media" DROP COLUMN IF EXISTS "cast";--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "media_cast" ADD CONSTRAINT "media_cast_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_cast" ADD CONSTRAINT "media_cast_cast_member_id_cast_members_id_fk" FOREIGN KEY ("cast_member_id") REFERENCES "public"."cast_members"("id") ON DELETE cascade ON UPDATE no action;
