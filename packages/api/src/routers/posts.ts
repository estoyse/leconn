import { posts as postsTable } from "@leconn/db/schema/posts";
import { protectedProcedure, router } from "..";
import { z } from "zod";
import { user } from "@leconn/db/schema/auth";
import { and, desc, eq, likes, sql } from "@leconn/db/schema/index";
import { TRPCError } from "@trpc/server";

export const postsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        content: z
          .string()
          .min(1, "Post cannot be empty")
          .max(280, "Post is too long"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [post] = await ctx.db
        .insert(postsTable)
        .values({
          userId: ctx.user.id,
          content: input.content,
        })
        .returning();
      return post;
    }),
  get: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(20),
        userId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const feedPosts = await ctx.db
        .select({
          id: postsTable.id,
          content: postsTable.content,
          createdAt: postsTable.createdAt,
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            image: user.image,
          },
          likeCount: sql<number>`cast(count(distinct ${likes.userId}) as int)`,
          replyCount: sql<number>`0`,
          repostCount: sql<number>`0`,
          views: sql<string>`'0'`,
          isLiked: sql<boolean>`bool_or(${likes.userId} = ${ctx.user.id})`,
        })
        .from(postsTable)
        .innerJoin(user, eq(postsTable.userId, user.id))
        .leftJoin(likes, eq(postsTable.id, likes.postId))
        .groupBy(postsTable.id, user.id)
        .orderBy(desc(postsTable.createdAt))
        .where(input.userId ? eq(postsTable.userId, input.userId) : undefined)
        .limit(input.limit);

      return feedPosts;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [deleted] = await ctx.db
        .delete(postsTable)
        .where(
          and(eq(postsTable.id, input.id), eq(postsTable.userId, ctx.user.id))
        )
        .returning();

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found or you do not own it",
        });
      }

      return { success: true };
    }),
});
