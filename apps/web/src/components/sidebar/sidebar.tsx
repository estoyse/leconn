import { Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { SidebarLeft } from "./left-sidebar";
import { SidebarRight } from "./right-sidebar";

export default function Sidebar() {
  return (
    <SidebarProvider>
      <div className='relative flex min-h-screen w-full flex-col md:flex-row bg-background text-foreground'>
        <SidebarLeft className='fixed left-0 top-0 z-30 hidden h-screen w-72 border-r md:flex overflow-y-auto' />

        <SidebarInset className='flex min-h-screen w-full flex-1 flex-col md:ml-72 md:mr-80'>
          <Outlet />
        </SidebarInset>

        <SidebarRight className='fixed right-0 top-0 z-30 hidden h-screen w-80 border-l md:flex overflow-y-auto' />
      </div>
    </SidebarProvider>
  );
}
