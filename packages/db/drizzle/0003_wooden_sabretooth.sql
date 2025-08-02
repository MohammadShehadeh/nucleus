CREATE TYPE "public"."role" AS ENUM('admin', 'student', 'instructor');--> statement-breakpoint
ALTER TABLE "verification" DROP CONSTRAINT "verification_identifier_user_id_fk";
