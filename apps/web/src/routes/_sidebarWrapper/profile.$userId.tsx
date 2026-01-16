import { Link, createFileRoute } from "@tanstack/react-router";
import { Link as LinkIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@/components/home/post";
import { usePostLike } from "@/hooks/use-post-like";

export const Route = createFileRoute("/_sidebarWrapper/profile/$userId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { userId } = Route.useParams();
  const trpc = useTRPC();

  const {
    data: user,
    isPending,
    error,
  } = useQuery(trpc.user.byId.queryOptions({ id: userId }));
  const postsOptions = trpc.posts.get.queryOptions({ userId });
  const postsQuery = useQuery(postsOptions);

  const { handleLike } = usePostLike(postsOptions.queryKey);

  if (isPending) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center p-8'>
        <h1 className='text-xl font-bold'>User not found</h1>
        <p className='text-muted-foreground'>
          The user you are looking for does not exist.
        </p>
        <Button variant='link' asChild className='mt-4'>
          <Link to='/'>Go Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <div className='relative p-2'>
        <div className='h-32 sm:h-48 bg-muted w-full rounded-md overflow-hidden'>
          <div className='w-full h-full bg-linear-to-b from-transparent to-black/30 flex items-end justify-end p-2'>
            <div className='flex items-center gap-1 text-white'>
              <LinkIcon className='w-4 h-4' />
              <a
                href={`https://${user.website}`}
                target='_blank'
                rel='noopener noreferrer'
                className='hover:underline'
              >
                {user.website}
              </a>
            </div>
          </div>
        </div>

        <div className='absolute bottom-0'>
          <Avatar className='w-32 h-32 border-8 m-2 border-background'>
            <AvatarImage
              src={user.image ?? undefined}
              alt={user.name ?? "User"}
            />
            <AvatarFallback className='text-4xl'>
              {user.name?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className='flex justify-end p-4 pt-4 sm:pt-4'>
          <Button variant='outline' className='rounded-full font-bold'>
            Follow
          </Button>
        </div>
      </div>

      <div className='px-6 flex flex-col gap-3'>
        <div className=''>
          <span className='text-2xl font-bold leading-tight '>{user.name}</span>
          <span className='px-1'>·</span>
          <span className='text-muted-foreground'>@{user.username}</span>
          <span className='px-1'>·</span>
          <span className='text-muted-foreground'>{user.location}</span>
        </div>

        <p className='whitespace-pre-wrap text-sm'>{user.bio}</p>

        <div className='flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground'>
          {/* <div className='flex items-center gap-1'>
            <Calendar className='w-4 h-4' />
            <span>
              Joined{" "}
              {user.createdAt
                ? format(new Date(user.createdAt), "MMMM yyyy")
                : "Unknown"}
            </span>
          </div> */}
        </div>

        <div className='flex gap-4 text-sm mt-1'>
          <Button variant='outline' className='rounded-full font-bold'>
            300 Following
          </Button>
          <Button variant='outline' className='rounded-full font-bold'>
            0 Follower
          </Button>
        </div>
      </div>

      <div className='mt-4'>
        <Tabs defaultValue='posts' className='w-full p-4'>
          <TabsList className='w-full'>
            <TabsTrigger value='posts'>Posts</TabsTrigger>
            <TabsTrigger value='replies'>Replies</TabsTrigger>
            <TabsTrigger value='media'>Media</TabsTrigger>
            <TabsTrigger value='likes'>Likes</TabsTrigger>
          </TabsList>

          <TabsContent value='posts' className='p-0'>
            {postsQuery.isLoading ? (
              <div className='p-8 text-center text-muted-foreground'>
                Loading posts...
              </div>
            ) : postsQuery.data && postsQuery.data.length > 0 ? (
              <div className='flex flex-col divide-y'>
                {postsQuery.data.map(post => (
                  <Post key={post.id} post={post} onLike={handleLike} />
                ))}
              </div>
            ) : (
              <div className='p-12 text-center'>
                <h3 className='text-lg font-bold'>No posts yet</h3>
                <p className='text-muted-foreground'>
                  When they post, it will show up here.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value='replies'
            className='p-8 text-center text-muted-foreground'
          >
            No replies yet.
          </TabsContent>
          <TabsContent
            value='media'
            className='p-8 text-center text-muted-foreground'
          >
            No media yet.
          </TabsContent>
          <TabsContent
            value='likes'
            className='p-8 text-center text-muted-foreground'
          >
            No likes yet.
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className='flex flex-col min-h-screen'>
      <div className='relative p-2'>
        <Skeleton className='h-32 sm:h-48 w-full' />
        <div className='absolute -bottom-16 left-4 px-4'>
          <div className='rounded-full p-1 bg-background'>
            <Skeleton className='w-32 h-32 rounded-full border-4 border-background' />
          </div>
        </div>
      </div>
      <div className='flex justify-end p-4'>
        <Skeleton className='h-10 w-24 rounded-full' />
      </div>
      <div className='px-6 flex flex-col gap-2'>
        <Skeleton className='h-8 w-56' />
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-16 w-full mt-2' />
      </div>
    </div>
  );
}
