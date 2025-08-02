import { relations } from "drizzle-orm";
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
    .$onUpdateFn(() => new Date()),
}));

export const enrollmentRelations = relations(enrollment, ({ one }) => ({
  course: one(course, {
    fields: [enrollment.courseId],
    references: [course.id],
  }),
  user: one(user, {
    fields: [enrollment.userId],
    references: [user.id],
  }),
}));
