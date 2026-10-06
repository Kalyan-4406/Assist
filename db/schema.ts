import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export const colleges = sqliteTable("colleges", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  is_demo: integer("is_demo").notNull().default(0),
  created_at: text("created_at").notNull(),
});
export const registrations = sqliteTable(
  "registrations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    college_id: text("college_id")
      .notNull()
      .references(() => colleges.id),
    branch: text("branch").notNull(),
    year: text("year").notNull(),
    idea_text: text("idea_text").notNull(),
    build_card: text("build_card").notNull(),
    own_code: text("own_code").notNull().unique(),
    ref_code: text("ref_code"),
    angle: text("angle"),
    is_ambassador: integer("is_ambassador").notNull().default(0),
    is_demo: integer("is_demo").notNull().default(0),
    readiness: text("readiness")
      .notNull()
      .default('{"laptop":false,"account":false,"repo":false}'),
    consent_at: text("consent_at").notNull(),
    created_at: text("created_at").notNull(),
  },
  (t) => [
    index("registrations_college_created").on(t.college_id, t.created_at),
    index("registrations_ref_demo").on(t.ref_code, t.is_demo),
  ],
);
export const events = sqliteTable(
  "events",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull(),
    college_id: text("college_id").references(() => colleges.id),
    ref_code: text("ref_code"),
    session_id: text("session_id").notNull(),
    is_demo: integer("is_demo").notNull().default(0),
    created_at: text("created_at").notNull(),
  },
  (t) => [
    index("events_type_college").on(t.type, t.college_id),
    index("events_created_demo").on(t.created_at, t.is_demo),
  ],
);
export const llmCalls = sqliteTable("llm_calls", {
  id: text("id").primaryKey(),
  feature: text("feature").notNull(),
  latency_ms: integer("latency_ms").notNull(),
  fallback_used: integer("fallback_used").notNull(),
  created_at: text("created_at").notNull(),
});
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  expires_at: integer("expires_at").notNull(),
});
export const aiCache = sqliteTable("ai_cache", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  source: text("source").notNull(),
  created_at: text("created_at").notNull(),
});
