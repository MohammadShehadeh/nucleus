import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

import { course } from "./course";
import { user } from "./user";

export const enrollment = pgTable("enrollment", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  courseId: t
    .uuid()
    .notNull()
    .references(() => course.id),
  userId: t
    .text()
    .notNull()
    .references(() => user.id),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));
