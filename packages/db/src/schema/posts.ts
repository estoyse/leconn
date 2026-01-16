import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  foreignKey,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { nanoid } from "nanoid";

export const posts = pgTable(
  "posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn((): string => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    parentId: text("parent_id"),
    rootId: text("root_id"),

    content: text("content").notNull(),

    likeCount: integer("like_count").default(0).notNull(),
    repostCount: integer("repost_count").default(0).notNull(),
    replyCount: integer("reply_count").default(0).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => [
    index("posts_user_id_idx").on(table.userId),
    index("posts_parent_id_idx").on(table.parentId),
    index("posts_root_id_idx").on(table.rootId),
    index("posts_created_at_idx").on(table.createdAt),

    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "posts_parent_id_fk",
    }).onDelete("cascade"),

    foreignKey({
      columns: [table.rootId],
      foreignColumns: [table.id],
      name: "posts_root_id_fk",
    }).onDelete("cascade"),
  ]
);
