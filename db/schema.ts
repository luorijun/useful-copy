import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const drops = sqliteTable("drops", {
  id: text("id").primaryKey(),
  kind: text("kind", { enum: ["text", "file"] }).notNull(),
  textContent: text("text_content"),
  objectKey: text("object_key"),
  fileName: text("file_name"),
  mimeType: text("mime_type"),
  fileSize: integer("file_size"),
  accessSalt: text("access_salt"),
  accessHash: text("access_hash"),
  createdAt: integer("created_at").notNull(),
  expiresAt: integer("expires_at").notNull(),
});

export const accessCodeSequence = sqliteTable("access_code_sequence", {
  name: text("name").primaryKey(),
  nextValue: integer("next_value").notNull(),
});
