// schema.ts

import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial().primaryKey(),
  firstName: text().notNull(),
  lastName: text().notNull(),
  email: text().unique().notNull(),
  phone: text().unique().notNull(),
  dni: integer().unique(),
  address: text(),
  verified: boolean().notNull().default(false),
  hash: text().notNull()
});

export const sessionTokens = pgTable("tokens", {
  id: uuid().primaryKey().defaultRandom(),
  userId: integer().notNull().references(() => users.id, { onDelete: "cascade" })
});

export const verificationTokens = pgTable("verification_tokens", {
  id: uuid().primaryKey().defaultRandom(),
  userId: integer().notNull().unique().references(() => users.id, { onDelete: "cascade" }),
});

export const courses = pgTable("courses", {
  id: serial().primaryKey(),
  title: text().notNull(),
  description: text().notNull(),
  image: text().notNull()
});

export const companies = pgTable("company", {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().unique().notNull(),
  phone: text().unique().notNull(),
  address: text().notNull(),
  description: text().notNull(),
  logo: text().notNull()
});

export const skills = pgTable("skills", {
  id: serial().primaryKey(),
  skill: text().notNull()
});

export const offers = pgTable("offers", {
  id: serial().primaryKey(),
  companyId: integer().notNull().references(() => companies.id, { onDelete: "cascade" }),
  title: text().notNull(),
  requirements: text().notNull(),
  duration: text().notNull(),
  salary: integer().notNull(),
  vacancies: integer().notNull(),
  tasks: text().notNull(),
  image: text().notNull(),
  applicationDeadline: timestamp().notNull(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull()
});

export const offersCourses = pgTable("offers_courses", {
  id: serial().primaryKey(),
  offerId: integer().notNull().references(() => offers.id, { onDelete: "cascade" }),
  courseId: integer().notNull().references(() => courses.id, { onDelete: "cascade" })
});

export const offersSkills = pgTable("offers_skills", {
  id: serial().primaryKey(),
  offerId: integer().notNull().references(() => offers.id, { onDelete: "cascade" }),
  skillId: integer().notNull().references(() => skills.id, { onDelete: "cascade" })
});

export const offersRequiredDocuments = pgTable("offers_required_documents", {
  id: serial().primaryKey(),
  offerId: integer().notNull().references(() => offers.id, { onDelete: "cascade" }),
  description: text().notNull()
});

export const applications = pgTable("applications", {
  id: serial().primaryKey(),
  userId: integer().notNull().references(() => users.id, { onDelete: "cascade" }),
  offerId: integer().notNull().references(() => offers.id, { onDelete: "cascade" }),
  status: text().notNull(),
  createdAt: timestamp().notNull()
});

export const applicationDocuments = pgTable("application_documents", {
  id: serial().primaryKey(),
  applicationId: integer().notNull().references(() => applications.id, { onDelete: "cascade" }),
  documentPath: text().notNull()
});

export const userSkills = pgTable("user_skills", {
  id: serial().primaryKey(),
  userId: integer().notNull().references(() => users.id, { onDelete: "cascade" }),
  skillId: integer().notNull().references(() => skills.id, { onDelete: "cascade" })
});

export const userCourses = pgTable("user_courses", {
  id: serial().primaryKey(),
  userId: integer().notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: integer().notNull().references(() => courses.id, { onDelete: "cascade" })
});



// ---- Relaciones ----

export const usersRelations = relations(users, ({ one, many }) => ({
  tokens: many(sessionTokens),
  verificationToken: one(verificationTokens)
}))

export const tokensRelations = relations(sessionTokens, ({ one }) => ({
  user: one(users, {
    fields: [sessionTokens.userId],
    references: [users.id]
  })
}))

export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [verificationTokens.userId],
    references: [users.id]
  })
}))
