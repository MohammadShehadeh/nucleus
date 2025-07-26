import { relations } from "drizzle-orm";

import { course, lesson, module } from "../course";
import { enrollment } from "../enrollment";
import { user } from "../user";

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
