import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import { eq } from "@lms/db";
import { db } from "@lms/db/client";
import {
  course,
  courseInsertSchema,
  courseSelectSchema,
  courseUpdateSchema,
} from "@lms/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const courseRouter = {
  create: protectedProcedure
    .input(courseInsertSchema)
    .mutation(async ({ input }) => {
      return await db.insert(course).values(input).returning();
    }),
  update: protectedProcedure
    .input(courseUpdateSchema.required({ id: true }))
    .mutation(async ({ input }) => {
      await db.update(course).set(input).where(eq(course.id, input.id));
    }),
  delete: protectedProcedure
    .input(courseSelectSchema.pick({ id: true }))
    .mutation(async ({ input }) => {
      await db.delete(course).where(eq(course.id, input.id));
    }),
  getById: publicProcedure
    .input(courseSelectSchema.pick({ id: true }))
    .query(async ({ input }) => {
      const results = await db
        .select()
        .from(course)
        .where(eq(course.id, input.id))
        .limit(1);

      if (!results[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      return results[0];
    }),
  getBySlug: publicProcedure
    .input(courseSelectSchema.pick({ slug: true }))
    .query(async ({ input }) => {
      const results = await db
        .select()
        .from(course)
        .where(eq(course.slug, input.slug))
        .limit(1);

      if (!results[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      return results[0];
    }),
  getByInstructorId: protectedProcedure
    .input(courseSelectSchema.pick({ instructorId: true }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(course)
        .where(eq(course.instructorId, input.instructorId));
    }),
} satisfies TRPCRouterRecord;
