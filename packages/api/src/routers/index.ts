import { protectedProcedure, publicProcedure, router } from "../index";
import { likesRouter } from "./likes";
import { postsRouter } from "./posts";
import { userRouter } from "./user";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.user,
    };
  }),
  posts: postsRouter,
  likes: likesRouter,
  user: userRouter,
});
export type AppRouter = typeof appRouter;
