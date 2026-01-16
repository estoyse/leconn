import { protectedProcedure, router } from "..";
import { z } from "zod";
import { likes, and, eq } from "@leconn/db/schema/index";

export const likesRouter = router({
  toggleLike: protectedProcedure
    .input(z.object({ postId: z.string(), action: z.enum(["like", "unlike"]) }))
    .mutation(async ({ ctx, input }) => {
      if (input.action === "like") {
        await ctx.db
          .insert(likes)
          .values({
            postId: input.postId,
            userId: ctx.user.id,
          })
          .onConflictDoNothing();
        return;
      } else {
        await ctx.db
          .delete(likes)
          .where(
            and(eq(likes.userId, ctx.user.id), eq(likes.postId, input.postId))
          );
        return;
      }
    }),
});
