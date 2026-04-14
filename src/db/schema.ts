import type { AdapterAccount } from "next-auth/adapters";
import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }),
  image: text("image"),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
  }),
);

export const pomodoroCompletions = pgTable(
  "pomodoro_completions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    focusSeconds: integer("focus_seconds").notNull(),
    focusMinutes: integer("focus_minutes").notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userCompletedAtUnique: uniqueIndex(
      "pomodoro_completions_user_completed_at_idx",
    ).on(table.userId, table.completedAt),
  }),
);

export const userProgress = pgTable("user_progress", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  totalFocusCompletions: integer("total_focus_completions")
    .default(0)
    .notNull(),
  totalFocusMinutes: integer("total_focus_minutes").default(0).notNull(),
  lastCompletedAt: timestamp("last_completed_at", {
    mode: "date",
    withTimezone: true,
  }),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
