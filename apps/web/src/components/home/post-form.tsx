import type React from "react";

import { useState, useRef, Activity } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { Folder, Images, MessagesSquare, Smile } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";

export default function PostForm() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const queryKey = trpc.posts.get.queryKey({ limit: 10 });
  const mutationOptions = trpc.posts.create.mutationOptions();

  const { mutate: createTweet, isPending: isCreatingTweet } = useMutation({
    mutationFn: mutationOptions.mutationFn,
    mutationKey: mutationOptions.mutationKey,
    onMutate: async newPost => {
      await queryClient.cancelQueries({ queryKey });
      const previousPosts = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        const optimisticPost = {
          id: `optimistic-${Date.now()}`,
          content: newPost.content,
          createdAt: new Date().toISOString(),
          user: {
            id: session?.user?.id || "unknown",
            name: session?.user?.name || "Unknown",
            username: session?.user?.username || "unknown",
            image: session?.user?.image || null,
          },
          likeCount: 0,
          replyCount: 0,
          repostCount: 0,
          isLiked: false,
        };

        if (Array.isArray(old)) {
          return [optimisticPost, ...old];
        }
        return [optimisticPost];
      });

      return { previousPosts };
    },
    onError: (_err, _newPost, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKey, context.previousPosts);
      }
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await queryClient.invalidateQueries({ queryKey });
    },
  });
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_CHARS = 280;

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        400,
        textareaRef.current.scrollHeight
      )}px`;
    }
  };

  const handlePost = () => {
    createTweet({ content });
    setContent("");
  };
  const isOverLimit = content.length > MAX_CHARS;
  const canPost = content.trim().length > 0 && !isOverLimit;

  return (
    <div className='p-2 pb-0'>
      <Card className='p-0 gap-0'>
        <CardHeader className='p-0'>
          <div className='flex items-center gap-4  p-4 dark:border-gray-800/30'>
            <div className='relative'>
              <Avatar>
                <AvatarImage
                  src={session?.user.image || "/placeholder.svg"}
                  alt='User'
                />
                <AvatarFallback>
                  {isSessionPending ? null : session?.user.name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className='font-medium text-gray-800 dark:text-gray-200'>
              {session?.user.name}
            </h3>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className='p-0'>
          <div className='p-2'>
            <Textarea
              placeholder='What is on Your mind?'
              value={content}
              onChange={handleInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                if (content.length === 0) {
                  setIsFocused(false);
                }
              }}
              ref={textareaRef}
              className={cn(
                "min-h-[48px] resize-none bg-transparent text-xl font-normal shadow-none focus-visible:ring-0",
                content.length > 0 ? "h-auto" : "h-12"
              )}
            />
            <Activity mode={isFocused ? "visible" : "hidden"}>
              <div className='flex items-center justify-between px-4'>
                <div className='flex items-center gap-4'>
                  <div
                    className={cn("text-sm", isOverLimit && "text-destructive")}
                  >
                    {content.length}/{MAX_CHARS} characters
                  </div>
                </div>
                <div className='py-2'>
                  <Button variant='ghost'>
                    <Smile />
                  </Button>
                </div>
              </div>
            </Activity>
          </div>
        </CardContent>
        <CardFooter className='p-0'>
          <div className='flex items-center justify-between pb-4 w-full px-2'>
            <div className='flex items-center gap-1'>
              <Button variant='ghost'>
                <Images />
                Photo
              </Button>
              <Button variant='ghost'>
                <Folder />
                Document
              </Button>
              <Button variant='ghost'>
                <MessagesSquare />
                <span className='hidden md:block'>Poll</span>
              </Button>
            </div>
            <Button disabled={!canPost || isCreatingTweet} onClick={handlePost}>
              <span className='hidden md:block'>Post</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );

  // return (
  //   <div className='w-full max-w-xl border-b border-border p-4 transition-colors'>
  //     <div className='flex gap-3'>
  //       <Avatar className='h-10 w-10 shrink-0'>
  //         <AvatarImage
  //           src={session?.user.image || "/placeholder.svg"}
  //           alt='User'
  //         />
  //         <AvatarFallback>
  //           {isSessionPending ? null : session?.user.name?.[0]}
  //         </AvatarFallback>
  //       </Avatar>

  //       <div className='flex flex-1 flex-col gap-2'>
  //         <Textarea
  //           ref={textareaRef}
  //           placeholder="What's happening?"
  //           className={cn(
  //             "min-h-[48px] resize-none border-none bg-transparent text-xl font-normal shadow-none focus-visible:ring-0",
  //             content.length > 0 ? "h-auto" : "h-12"
  //           )}
  //           value={content}
  //           onChange={handleInput}
  //           onFocus={() => setIsFocused(true)}
  //         />

  //         <Activity mode={isFocused ? "visible" : "hidden"}>
  //           <div className='flex items-center justify-between border-t border-border pt-3'>
  //             <div className='flex items-center gap-1'>
  //               <Button
  //                 variant='ghost'
  //                 size='icon'
  //                 className='h-9 w-9 rounded-full hover:bg-primary/10'
  //               >
  //                 <ImageIcon className='h-5 w-5' />
  //                 <span className='sr-only'>Upload image</span>
  //               </Button>
  //               <Button
  //                 variant='ghost'
  //                 size='icon'
  //                 className='h-9 w-9 rounded-full hover:bg-primary/10'
  //               >
  //                 <List className='h-5 w-5' />
  //                 <span className='sr-only'>Add poll</span>
  //               </Button>
  //               <Button
  //                 variant='ghost'
  //                 size='icon'
  //                 className='h-9 w-9 rounded-full hover:bg-primary/10'
  //               >
  //                 <Smile className='h-5 w-5' />
  //                 <span className='sr-only'>Add emoji</span>
  //               </Button>
  //               <Button
  //                 variant='ghost'
  //                 size='icon'
  //                 className='h-9 w-9 rounded-full hover:bg-primary/10'
  //               >
  //                 <Calendar className='h-5 w-5' />
  //                 <span className='sr-only'>Schedule post</span>
  //               </Button>
  //               <Button
  //                 variant='ghost'
  //                 size='icon'
  //                 className='h-9 w-9 rounded-full hover:bg-primary/10'
  //               >
  //                 <MapPin className='h-5 w-5' />
  //                 <span className='sr-only'>Add location</span>
  //               </Button>
  //             </div>

  //             <div className='flex items-center gap-3'>
  //               <div className='relative flex h-8 w-8 items-center justify-center'>
  //                 <svg className='h-full w-full -rotate-90 transform'>
  //                   <circle
  //                     cx='16'
  //                     cy='16'
  //                     r='14'
  //                     stroke='currentColor'
  //                     strokeWidth='2'
  //                     fill='transparent'
  //                     className='text-muted'
  //                   />
  //                   <circle
  //                     cx='16'
  //                     cy='16'
  //                     r='14'
  //                     stroke='currentColor'
  //                     strokeWidth='2'
  //                     fill='transparent'
  //                     strokeDasharray={88}
  //                     strokeDashoffset={88 - (progress / 100) * 88}
  //                     className={cn(
  //                       "transition-all duration-300",
  //                       isOverLimit
  //                         ? "text-destructive"
  //                         : progress > 80
  //                           ? "text-yellow-500"
  //                           : "text-primary"
  //                     )}
  //                   />
  //                 </svg>
  //                 {content.length >= MAX_CHARS - 20 && (
  //                   <span
  //                     className={cn(
  //                       "absolute text-[10px] font-medium",
  //                       isOverLimit
  //                         ? "text-destructive"
  //                         : "text-muted-foreground"
  //                     )}
  //                   >
  //                     {MAX_CHARS - content.length}
  //                   </span>
  //                 )}
  //               </div>

  //               <div className='h-8 w-px bg-border mx-1' />

  //               <Button
  //                 disabled={!canPost || isCreatingTweet}
  //                 onClick={handlePost}
  //                 className='rounded-full bg-primary px-5 py-0 font-bold text-primary-foreground hover:bg-primary/90'
  //               >
  //                 Post
  //               </Button>
  //             </div>
  //           </div>
  //         </Activity>
  //       </div>
  //     </div>
  //   </div>
  // );
}
