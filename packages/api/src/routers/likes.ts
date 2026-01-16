import { protectedProcedure, router } from "..";
import { z } from "zod";
import { likes } from "@leconn/db/schema/likes";
import { posts } from "@leconn/db/schema/posts";
import { and, eq, sql } from "@leconn/db/schema/index";
import { TRPCError } from "@trpc/server";

export const likesRouter = router({
  toggleLike: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async tx => {
        const existing = await tx
          .select()
          .from(likes)
          .where(
            and(eq(likes.userId, ctx.user.id), eq(likes.postId, input.postId))
          )
          .limit(1);

        if (existing.length > 0) {
          await tx
            .delete(likes)
            .where(
              and(eq(likes.userId, ctx.user.id), eq(likes.postId, input.postId))
            );

          const result = await tx
            .update(posts)
            .set({
              likeCount: sql`${posts.likeCount} - 1`,
              updatedAt: new Date(),
            })
            .where(eq(posts.id, input.postId))
            .returning({ likeCount: posts.likeCount });

          const post = result[0];
          if (!post) {
            throw new TRPCError({ code: "NOT_FOUND" });
          }

          return { liked: false, likeCount: post.likeCount };
        }

        await tx.insert(likes).values({
          postId: input.postId,
          userId: ctx.user.id,
        });

        const result = await tx
          .update(posts)
          .set({
            likeCount: sql`${posts.likeCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(posts.id, input.postId))
          .returning({ likeCount: posts.likeCount });

        const post = result[0];
        if (!post) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return { liked: true, likeCount: post.likeCount };
      });
    }),
});
