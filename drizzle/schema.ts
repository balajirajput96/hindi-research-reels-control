import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const reels = mysqlTable(
  "reels",
  {
    id: int("id").autoincrement().primaryKey(),
    reelId: varchar("reelId", { length: 32 }).notNull().unique(),
    sequence: int("sequence").notNull().unique(),
    batchId: varchar("batchId", { length: 24 }).notNull(),
    domain: varchar("domain", { length: 128 }).notNull(),
    angle: varchar("angle", { length: 128 }).notNull(),
    format: varchar("format", { length: 160 }).notNull(),
    language: varchar("language", { length: 24 }).notNull(),
    durationTargetSeconds: int("durationTargetSeconds").notNull(),
    aspectRatio: varchar("aspectRatio", { length: 16 }).notNull(),
    researchStatus: varchar("researchStatus", { length: 64 }).notNull(),
    scriptStatus: varchar("scriptStatus", { length: 64 }).notNull(),
    mediaStatus: varchar("mediaStatus", { length: 64 }).notNull(),
    qcStatus: varchar("qcStatus", { length: 64 }).notNull(),
    driveStatus: varchar("driveStatus", { length: 64 }).notNull(),
    sourceRefsJson: text("sourceRefsJson").notNull(),
    artifactMetaJson: text("artifactMetaJson").notNull(),
    summary: text("summary").notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("reels_batch_idx").on(table.batchId),
    index("reels_domain_idx").on(table.domain),
    index("reels_drive_status_idx").on(table.driveStatus),
  ],
);

export const operationSnapshots = mysqlTable(
  "operation_snapshots",
  {
    id: int("id").autoincrement().primaryKey(),
    operationKey: varchar("operationKey", { length: 64 }).notNull().unique(),
    label: varchar("label", { length: 160 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    detail: text("detail").notNull(),
    metadataJson: text("metadataJson").notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("operation_status_idx").on(table.status)],
);

export const artifactImports = mysqlTable(
  "artifact_imports",
  {
    id: int("id").autoincrement().primaryKey(),
    sourceName: varchar("sourceName", { length: 160 }).notNull(),
    importedCount: int("importedCount").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    detail: text("detail").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("artifact_import_source_idx").on(table.sourceName)],
);

export type Reel = typeof reels.$inferSelect;
export type InsertReel = typeof reels.$inferInsert;
export type OperationSnapshot = typeof operationSnapshots.$inferSelect;
