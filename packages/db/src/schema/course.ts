import { relations, sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

import { enrollment } from "./enrollments";
import { user } from "./users";

export interface Attachment {
  name: string;
  url: string;
  type: "file";
}

export interface Video {
  name: string;
  url: string;
  type: "video";
}

export interface Content {
  attachments: Attachment[];
  video: Video;
}

export const course = pgTable("course", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 256 }).notNull(),
  slug: t.varchar({ length: 256 }).unique().notNull(),
  description: t.text().notNull(),
  instructorId: t
    .text()
    .notNull()
    .references(() => user.id),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const module = pgTable("module", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 256 }).notNull(),
  description: t.text().notNull(),
  courseId: t
    .uuid()
    .notNull()
    .references(() => course.id),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const lesson = pgTable("lesson", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 256 }).notNull(),
  moduleId: t
    .uuid()
    .notNull()
    .references(() => module.id),
  description: t.text().notNull(),
  content: t.jsonb().$type<Content>().notNull(),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const courseRelations = relations(course, ({ many, one }) => ({
  modules: many(module),
  enrollments: many(enrollment),
  instructor: one(user, {
    fields: [course.instructorId],
    references: [user.id],
  }),
}));

export const moduleRelations = relations(module, ({ many, one }) => ({
  lessons: many(lesson),
  course: one(course, {
    fields: [module.courseId],
    references: [course.id],
  }),
}));

export const lessonRelations = relations(lesson, ({ one }) => ({
  module: one(module, {
    fields: [lesson.moduleId],
    references: [module.id],
  }),
}));
