import { GraduationCap, Users } from "lucide-react"
import { NavLink } from "react-router"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"

const userRoles = [
    { label: "Student", href: "/students" },
    { label: "Admin", href: "#" },
    { label: "Staff", href: "#" },
    { label: "Teacher", href: "#" },
    { label: "Parent", href: "#" },
]

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <GraduationCap className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Aulix</span>
                                    <span className="truncate text-xs text-sidebar-foreground/70">
                                        School Management
                                    </span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive tooltip="Users">
                                    <Users />
                                    <span>Users</span>
                                </SidebarMenuButton>
                                <SidebarMenuSub>
                                    {userRoles.map((role) => (
                                        <SidebarMenuSubItem key={role.label}>
                                            <SidebarMenuSubButton asChild>
                                                <NavLink
                                                    to={role.href}
                                                    className={({ isActive }) =>
                                                        isActive ? "font-medium text-sidebar-foreground" : undefined
                                                    }
                                                >
                                                    <span>{role.label}</span>
                                                </NavLink>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter />
        </Sidebar>
    )
}
