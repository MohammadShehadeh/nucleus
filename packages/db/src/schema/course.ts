import { pgTable } from "drizzle-orm/pg-core";

import { user } from "./user";

export interface File {
  name: string;
  url: string;
  type: "file";
}

export interface Video {
  name: string;
  url: string;
  type: "video";
}

export interface Attachments {
  files?: File[];
  videos?: Video[];
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
  updatedAt: t.timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => new Date()),
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
  updatedAt: t.timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => new Date()),
}));

export const lesson = pgTable("lesson", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 256 }).notNull(),
  moduleId: t
    .uuid()
    .notNull()
    .references(() => module.id),
  description: t.text().notNull(),
  attachments: t.jsonb().$type<Attachments>().notNull(),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t.timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => new Date()),
}));
