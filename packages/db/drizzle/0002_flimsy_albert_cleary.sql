ALTER TABLE "lesson" ADD COLUMN "attachments" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ADD CONSTRAINT "verification_identifier_user_id_fk" FOREIGN KEY ("identifier") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" DROP COLUMN "content";