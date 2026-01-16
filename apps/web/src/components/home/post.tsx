import { useTRPC } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth-client";
import { Card } from "../ui/card";
import {
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link } from "@tanstack/react-router";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { formatDateDetailed, formatPostDate } from "@/lib/date";
import {
  Ban,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

interface PostProps {
  post: any;
  onLike: (postId: string, isLiked: boolean) => void;
}

export function Post({ post, onLike }: PostProps) {
  const isMobile = useIsMobile();
  const { data: session } = authClient.useSession();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const deletePostMutation = useMutation(trpc.posts.delete.mutationOptions());

  return (
    <Card className='mb-2 py-3 gap-3 '>
      <CardHeader>
        <CardTitle>
          <Link
            to='/profile/$userId'
            params={{ userId: post.user.id }}
            className='gap-2 justify-start inline-flex'
          >
            <Avatar className='h-10 w-10 shrink-0'>
              <AvatarImage
                src={post.user.image || "/placeholder.svg"}
                alt={post.user.name}
              />
              <AvatarFallback>{post.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className='flex items-center gap-2'>
              <div className='cursor-pointer'>
                <h1 className='font-medium text-sm sm:text-sm'>
                  {post.user.name}
                </h1>
                <div className='flex items-center gap-1.5  text-muted-foreground sm:text-xs'>
                  <span>
                    <span className='text-purple-500'>
                      @{post.user.username}
                    </span>
                  </span>
                  <span>·</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className='text-muted-foreground hover:underline'>
                        {formatPostDate(post.createdAt)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{formatDateDetailed(post.createdAt)}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </Link>
        </CardTitle>
        <CardAction>
          {" "}
          <div className='flex items-center justify-between'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 rounded-full text-muted-foreground'
                >
                  <MoreHorizontal className='h-4 w-4' />
                  <span className='sr-only'>More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-48 rounded-lg'
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                {session?.user.id === post.user.id && (
                  <>
                    <DropdownMenuItem
                      variant='destructive'
                      onClick={() =>
                        deletePostMutation.mutateAsync(
                          { id: post.id },
                          {
                            onSuccess: () => {
                              queryClient.invalidateQueries({
                                queryKey: trpc.posts.get.queryKey(),
                              });
                            },
                          }
                        )
                      }
                    >
                      <Trash2 />
                      <span>Delete Post</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem>
                  <Ban />
                  <span>Report</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>{post.content}</p>
      </CardContent>
      <Separator />
      <CardFooter>
        <div className='flex'>
          <button className='group flex items-center justify-start gap-2 transition-colors hover:text-blue-500'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full group-hover:bg-blue-500/10'>
              <MessageCircle className='h-[18px] w-[18px]' />
            </div>
            <span className='text-xs'>{post.replyCount || ""}</span>
          </button>
          <button className='group flex items-center justify-start gap-2 transition-colors hover:text-green-500'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full group-hover:bg-green-500/10'>
              <Repeat2 className='h-[18px] w-[18px]' />
            </div>
            <span className='text-xs'>{post.repostCount || ""}</span>
          </button>
          <button
            className={clsx(
              "group flex items-center justify-start gap-0 transition-colors hover:text-red-500",
              post.isLiked && "text-pink-500"
            )}
            onClick={e => {
              e.stopPropagation();
              onLike(post.id, post.isLiked);
            }}
          >
            <div className='flex h-8 w-8 items-center justify-center rounded-full group-hover:bg-red-500/10'>
              <Heart
                fill={post.isLiked ? "#f6339a" : "transparent"}
                className={clsx(
                  "h-[18px] w-[18px] transition-transform duration-200",
                  post.isLiked && "scale-110"
                )}
              />
            </div>
            <div className='relative h-4 min-w-[1ch] overflow-hidden flex items-center'>
              <AnimatePresence mode='popLayout' initial={false}>
                {post.likeCount > 0 && (
                  <motion.span
                    key={post.likeCount}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className='text-xs absolute inset-0 flex items-center'
                  >
                    {post.likeCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </button>
        </div>
      </CardFooter>
    </Card>
  );

  // return (
  //   <article className='flex gap-3 border-b border-border px-4 py-2 hover:bg-muted/30 transition-colors cursor-pointer'>
  //     <Link to="/profile/$userId" params={{ userId: post.user.id }}>
  //       <Avatar className='h-10 w-10 shrink-0'>
  //         <AvatarImage
  //           src={post.user.image || "/placeholder.svg"}
  //           alt={post.user.name}
  //         />
  //         <AvatarFallback>{post.user.name[0]}</AvatarFallback>
  //       </Avatar>
  //     </Link>

  //     <div className='flex flex-1 flex-col gap-1'>

  //       <p className='text-[15px] leading-normal'>{post.content}</p>

  //       <div className='grid grid-cols-4 max-w-md text-muted-foreground w-full'>
  //         <button className='group flex items-center justify-start gap-2 transition-colors hover:text-primary'>
  //           <div className='flex h-8 w-8 items-center justify-center rounded-full group-hover:bg-primary/10'>
  //             <MessageCircle className='h-[18px] w-[18px]' />
  //           </div>
  //           <span className='text-xs'>{post.replyCount || ""}</span>
  //         </button>

  //         <button
  //           className={clsx(
  //             "group flex items-center justify-start gap-2 transition-colors hover:text-pink-500",
  //             post.isLiked && "text-pink-500"
  //           )}
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             onLike(post.id);
  //           }}
  //         >
  //           <div className='flex h-8 w-8 items-center justify-center rounded-full group-hover:bg-pink-500/10'>
  //             <Heart
  //               fill={post.isLiked ? "#f6339a" : "transparent"}
  //               className={clsx(
  //                 "h-[18px] w-[18px] transition-transform duration-200",
  //                 post.isLiked && "scale-110"
  //               )}
  //             />
  //           </div>
  //           <div className="relative h-4 min-w-[1ch] overflow-hidden flex items-center">
  //             <AnimatePresence mode="popLayout" initial={false}>
  //               {post.likeCount > 0 && (
  //                 <motion.span
  //                   key={post.likeCount}
  //                   initial={{ y: "100%", opacity: 0 }}
  //                   animate={{ y: 0, opacity: 1 }}
  //                   exit={{ y: "-100%", opacity: 0 }}
  //                   transition={{ type: "spring", stiffness: 500, damping: 30 }}
  //                   className='text-xs absolute inset-0 flex items-center'
  //                 >
  //                   {post.likeCount}
  //                 </motion.span>
  //               )}
  //             </AnimatePresence>
  //           </div>
  //         </button>

  //         <button className='group flex items-center justify-start gap-2 transition-colors hover:text-primary'>
  //           <div className='flex h-8 w-8 items-center justify-center rounded-full group-hover:bg-primary/10'>
  //             <Share className='h-[18px] w-[18px]' />
  //           </div>
  //         </button>
  //       </div>
  //     </div>
  //   </article>
  // );
}
