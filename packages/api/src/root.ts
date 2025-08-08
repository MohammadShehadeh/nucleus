import { authRouter } from "./router/auth";
import { courseRouter } from "./router/course";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  course: courseRouter,
});

export type AppRouter = typeof appRouter;
