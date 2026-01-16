import { z } from "zod";

import { user } from "@leconn/db/schema/auth";
import { eq } from "@leconn/db/schema/index";
import { TRPCError } from "@trpc/server";

import { publicProcedure, router } from "..";

export const userRouter = router({
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [userData] = await ctx.db
        .select({
          id: user.id,
          name: user.name,
          username: user.username,
          image: user.image,
          createdAt: user.createdAt,
          bio: user.bio,
          website: user.website,
          location: user.location,
          // We can add counts here later if needed or via separate queries
        })
        .from(user)
        .where(eq(user.id, input.id));

      if (!userData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return userData;
    }),
});
