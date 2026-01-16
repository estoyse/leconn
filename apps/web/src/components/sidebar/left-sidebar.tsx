import * as React from "react";
import { Home, TrendingUp, Users } from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  items: [
    {
      name: "Home",
      url: "/home",
      icon: Home,
    },
    {
      name: "Explore",
      url: "/explore",
      icon: TrendingUp,
    },
    {
      name: "Community",
      url: "/community",
      icon: Users,
    },
  ],
};

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible={"none"} {...props}>
      <SidebarContent>
        <NavMain projects={data.items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
