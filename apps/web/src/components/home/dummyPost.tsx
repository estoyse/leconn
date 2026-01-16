import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import clsx from "clsx";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "@/components/ui/separator";

interface PostProps {
  content: string;
}

export function DummyPost({ content }: PostProps) {
  const { data: session } = authClient.useSession();

  return (
    <Card className='mb-2 py-3 gap-3 opacity-50'>
      <CardHeader>
        <CardTitle>
          <div className='gap-2 justify-start inline-flex'>
            <Avatar className='h-10 w-10 shrink-0'>
              <AvatarImage
                src={session?.user.image || "/placeholder.svg"}
                alt={session?.user.name}
              />
              <AvatarFallback>{session?.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className='flex items-center gap-2'>
              <div className='cursor-pointer'>
                <h1 className='font-medium text-sm sm:text-sm'>
                  {session?.user.name}
                </h1>
                <div className='flex items-center gap-1.5  text-muted-foreground sm:text-xs'>
                  <span>
                    <span className='text-purple-500'>
                      @{session?.user.username}
                    </span>
                  </span>
                  <span>·</span>
                  <span>
                    <span className='text-purple-500'>Posting...</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardTitle>
        <CardAction>
          <div className='flex items-center justify-between'></div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>{content}</p>
      </CardContent>
      <Separator />
      <CardFooter>
        <div className='flex'>
          <button className='group flex items-center justify-start gap-2 transition-colors hover:text-blue-500'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full group-hover:bg-blue-500/10'>
              <MessageCircle className='h-[18px] w-[18px]' />
            </div>
            <span className='text-xs'></span>
          </button>
          <button className='group flex items-center justify-start gap-2 transition-colors hover:text-green-500'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full group-hover:bg-green-500/10'>
              <Repeat2 className='h-[18px] w-[18px]' />
            </div>
            <span className='text-xs'></span>
          </button>
          <button
            className={clsx(
              "group flex items-center justify-start gap-0 transition-colors hover:text-red-500"
            )}
          >
            <div className='flex h-8 w-8 items-center justify-center rounded-full group-hover:bg-red-500/10'>
              <Heart
                className={clsx(
                  "h-[18px] w-[18px] transition-transform duration-200"
                )}
              />
            </div>
            <div className='relative h-4 min-w-[1ch] overflow-hidden flex items-center'>
              <span className='text-xs'></span>
            </div>
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
