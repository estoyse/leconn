import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Post } from "./post";
import { DummyPost } from "./dummyPost";
import { usePostLike } from "@/hooks/use-post-like";

export function PostFeed() {
  const trpc = useTRPC();

  const postsOptions = trpc.posts.get.queryOptions({ limit: 10 });
  const feedQueryKey = postsOptions.queryKey;
  const { data: posts } = useQuery(postsOptions);

  const { handleLike } = usePostLike(feedQueryKey);

  return (
    <div className='flex flex-col p-2'>
      {posts?.map(post =>
        post.id.startsWith("optimistic-") ? (
          <DummyPost key={post.id} content={post.content} />
        ) : (
          <Post key={post.id} post={post} onLike={handleLike} />
        )
      )}
    </div>
  );
}
