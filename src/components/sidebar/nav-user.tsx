"use client"

import {
  IconCreditCard,
  IconDashboard,
  IconDeviceTv,
  IconDotsVertical,
  IconHome,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useSignOut } from "@/hooks/use-signout"

export function NavUser() {
  const { data : session, status } = useSession();
  const isPending = status === "loading";
  const { isMobile } = useSidebar();
  const handleSignOut = useSignOut();

  if(isPending) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={session?.user.image ?? `https://avatar.vercel.sh/${session?.user.email ?? 'user'}`} alt={session?.user.name ?? session?.user.email?.split("@")[0] ?? 'User'} />
                <AvatarFallback className="rounded-lg">
                  {session?.user.name && session.user.name.length > 0 ? session?.user.name.charAt(0).toUpperCase() : session?.user.email?.charAt(0).toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{session?.user.name && session.user.name.length > 0 ? session?.user.name.charAt(0).toUpperCase() : session?.user.email?.split("@")[0]?.charAt(0).toUpperCase() ?? 'U'}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {session?.user.email ?? 'No email'}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={session?.user.image ?? `https://avatar.vercel.sh/${session?.user.email ?? 'user'}`} alt={session?.user.name ?? session?.user.email?.split("@")[0] ?? 'User'} />
                <AvatarFallback className="rounded-lg">
                  {session?.user.name && session.user.name.length > 0 ? session?.user.name.charAt(0).toUpperCase() : session?.user.email?.charAt(0).toUpperCase() ?? 'U'}
                </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{session?.user.name && session.user.name.length > 0 ? session?.user.name.toUpperCase() : session?.user.email?.split("@")[0] ?? 'User'}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {session?.user.email ?? 'No email'} 
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/">
                <IconHome />
                Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin">
                <IconDashboard />
                Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/courses">
                <IconDeviceTv />
                Courses
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
