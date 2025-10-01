import { relations } from "drizzle-orm";

import { course, enrollment } from "../course";
import { account, session, user, verification } from "../user";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  enrollments: many(enrollment),
  courses: many(course),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const verificationRelations = relations(verification, ({ one }) => ({
  user: one(user, {
    fields: [verification.identifier],
    references: [user.id],
  }),
}));
