import type { TRPCRouterRecord } from "@trpc/server";

import { protectedProcedure, publicProcedure } from "../trpc";

export const courseRouter = {
  create: protectedProcedure.mutation(async () => {
    // TODO: Implement create
  }),
  update: protectedProcedure.mutation(async () => {
    // TODO: Implement update
  }),
  delete: protectedProcedure.mutation(async () => {
    // TODO: Implement delete
  }),
  getById: publicProcedure.query(async () => {
    // TODO: Implement getById
  }),
  getBySlug: publicProcedure.query(async () => {
    // TODO: Implement getBySlug
  }),
  getByInstructorId: protectedProcedure.query(async () => {
    // TODO: Implement getByInstructorId
  }),
} satisfies TRPCRouterRecord;
