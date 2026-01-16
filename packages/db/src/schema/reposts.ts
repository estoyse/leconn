import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { posts } from "./posts";
import { user } from "./auth";

export const reposts = pgTable(
  "reposts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => [
    index("post_reposts_post_id_idx").on(table.postId),
    index("post_reposts_user_id_idx").on(table.userId),
  ]
);
