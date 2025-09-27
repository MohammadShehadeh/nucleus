import { relations } from "drizzle-orm";

import {
  course,
  enrollment,
  lesson,
  module,
  resource,
  review,
} from "../course";
import { user } from "../user";

export const courseRelations = relations(course, ({ many, one }) => ({
  modules: many(module),
  enrollments: many(enrollment),
  instructor: one(user, {
    fields: [course.instructorId],
    references: [user.id],
  }),
  reviews: many(review),
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
  resource: one(resource, {
    fields: [lesson.resourceId],
    references: [resource.id],
  }),
}));

export const resourceRelations = relations(resource, ({ many }) => ({
  lessons: many(lesson),
}));

export const reviewRelations = relations(review, ({ one }) => ({
  course: one(course, {
    fields: [review.courseId],
    references: [course.id],
  }),
  user: one(user, {
    fields: [review.userId],
    references: [user.id],
  }),
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
