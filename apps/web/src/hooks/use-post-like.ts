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
  const clickCountRefs = useRef<Record<string, number>>({});

  const { mutate: toggleLike } = useMutation({
    ...trpc.likes.toggleLike.mutationOptions(),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleLike = (postId: string) => {
    // 1. Instant Optimistic Update
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      // Handle both array of posts (Feed) or single post (Post detail) if structure matches?
      // feed.tsx assumes `old` is an array. Let's keep it safe for array for now.
      if (Array.isArray(old)) {
        return old.map((p: any) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
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

    clickCountRefs.current[postId] = (clickCountRefs.current[postId] || 0) + 1;

    debounceRefs.current[postId] = setTimeout(() => {
      const clicks = clickCountRefs.current[postId];
      if (clicks % 2 !== 0) {
        toggleLike({ postId });
      }
      delete clickCountRefs.current[postId];
      delete debounceRefs.current[postId];
    }, 1500);
  };

  return { handleLike };
}
