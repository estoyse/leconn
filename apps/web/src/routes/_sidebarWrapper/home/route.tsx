import { PostFeed } from "@/components/home/feed";
import PostForm from "@/components/home/post-form";
import { getUser } from "@/functions/get-user";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebarWrapper/home")({
  component: Home,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function Home() {
  return (
    <>
      <PostForm />
      <PostFeed />
    </>
  );
}