import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { protectedProcedure, publicProcedure } from "../trpc";

export const postRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return [
      { id: "1", title: "Post 1", content: "Content 1" },
      { id: "2", title: "Post 2", content: "Content 2" },
    ];
  }),

  byId: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return { id: input.id, title: "Post 1", content: "Content 1" };
  }),

  create: protectedProcedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(({ ctx, input }) => {
      return { id: "1", title: input.title, content: input.content };
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return { id: input, title: "Post 1", content: "Content 1" };
  }),
} satisfies TRPCRouterRecord;
