import { relations } from "drizzle-orm";

import { course } from "../course";
import { enrollment } from "../enrollment";
import { user } from "../user";

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
