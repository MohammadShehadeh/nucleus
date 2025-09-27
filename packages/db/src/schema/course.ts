import { pgTable } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

import { user } from "./user";

export const course = pgTable("course", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 256 }).notNull(),
  slug: t.varchar({ length: 256 }).unique().notNull(),
  description: t.text().notNull(),
  language: t.varchar({ length: 16 }).default("en").notNull(),
  visibility: t.varchar({ length: 16 }).default("private").notNull(),
  published: t.boolean().notNull().default(false),
  publishedAt: t.timestamp(),
  instructorId: t
    .text()
    .notNull()
    .references(() => user.id),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => new Date()),
}));

export const module = pgTable("module", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 256 }).notNull(),
  description: t.text().notNull(),
  position: t.integer().notNull().default(0),
  courseId: t
    .uuid()
    .notNull()
    .references(() => course.id),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => new Date()),
}));

export const lesson = pgTable("lesson", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 256 }).notNull(),
  moduleId: t
    .uuid()
    .notNull()
    .references(() => module.id),
  description: t.text().notNull(),
  resourceId: t.uuid().references(() => resource.id),
  position: t.integer().notNull().default(0),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => new Date()),
}));

export const resource = pgTable("resource", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 256 }).notNull(),
  url: t.text().notNull(),
  metadata: t
    .jsonb()
    .$type<{
      sizeBytes?: number;
      mimeType?: string;
      durationSeconds?: number;
    }>()
    .notNull(),
  type: t.varchar({ length: 16 }).$type<"file" | "video">().notNull(),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => new Date()),
}));

export const review = pgTable("review", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  courseId: t
    .uuid()
    .notNull()
    .references(() => course.id),
  rating: t.integer().notNull(),
  comment: t.text().notNull(),
  userId: t
    .text()
    .notNull()
    .references(() => user.id),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => new Date()),
}));

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

// course zod schemas
export const courseInsertSchema = createInsertSchema(course);
export const courseSelectSchema = createSelectSchema(course);
export const courseUpdateSchema = createUpdateSchema(course);

// module zod schemas
export const moduleInsertSchema = createInsertSchema(module);
export const moduleSelectSchema = createSelectSchema(module);
export const moduleUpdateSchema = createUpdateSchema(module);

// lesson zod schemas
export const lessonInsertSchema = createInsertSchema(lesson);
export const lessonSelectSchema = createSelectSchema(lesson);
export const lessonUpdateSchema = createUpdateSchema(lesson);

// resource zod schemas
export const resourceInsertSchema = createInsertSchema(resource);
export const resourceSelectSchema = createSelectSchema(resource);
export const resourceUpdateSchema = createUpdateSchema(resource);

// review zod schemas
export const reviewInsertSchema = createInsertSchema(review);
export const reviewSelectSchema = createSelectSchema(review);
export const reviewUpdateSchema = createUpdateSchema(review);

// enrollment zod schemas
export const enrollmentInsertSchema = createInsertSchema(enrollment);
export const enrollmentSelectSchema = createSelectSchema(enrollment);
export const enrollmentUpdateSchema = createUpdateSchema(enrollment);
