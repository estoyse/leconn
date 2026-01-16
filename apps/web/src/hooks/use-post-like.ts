import { useTRPC } from "@/utils/trpc";
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useRef } from "react";

export function usePostLike(queryKey: QueryKey) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Refs for debouncing - keeping these separate per hook instance is fine
  // assuming this hook is used in a component that renders the list or is stable.
  // Actually, if we use this in a list component, we need to be careful.
  // In feed.tsx it was one ref for all posts because it was in the parent.
  // If we assume this hook is used in the parent (Feed), it works the same.
  const debounceRefs = useRef<Record<string, NodeJS.Timeout>>({});

  const { mutate: toggleLike } = useMutation({
    ...trpc.likes.toggleLike.mutationOptions(),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  /*
    Simple debounce:
    When user clicks, we immediately optimistic update.
    We also debounce the actual server request.
    If multiple clicks happen, the LAST state wins.
  */
  const handleLike = (postId: string, currentIsLiked: boolean) => {
    const newIsLiked = !currentIsLiked;
    const action = newIsLiked ? "like" : "unlike";

    // 1. Instant Optimistic Update
    // We update the cache to the NEW state immediately
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      if (Array.isArray(old)) {
        return old.map((p: any) =>
          p.id === postId
            ? {
                ...p,
                isLiked: newIsLiked,
                likeCount: newIsLiked ? p.likeCount + 1 : p.likeCount - 1,
                updatedAt: new Date(),
              }
            : p
        );
      }
      return old;
    });

    // 2. Debounce Server Call
    if (debounceRefs.current[postId]) {
      clearTimeout(debounceRefs.current[postId]);
    }

    debounceRefs.current[postId] = setTimeout(() => {
      toggleLike({ postId, action });
      delete debounceRefs.current[postId];
    }, 500);
  };

  return { handleLike };
}
