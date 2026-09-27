import { BookOpen, ChevronRight, GraduationCap, Users } from "lucide-react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import { NavLink, useLocation } from "react-router";

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
} from "@/components/ui/sidebar";
import { useHasAnyRole } from "@/hooks/use-has-role";
import { SUBJECT_VIEW_ROLES } from "@/schemas/subject";

const userRoles = [
  { label: "Student", href: "/students" },
  { label: "Staff", href: "/staff" },
  { label: "Admin", href: "#" },
  { label: "Teacher", href: "/teachers" },
  { label: "Parent", href: "#" },
];

export function AppSidebar() {
  const location = useLocation();
  const canViewSubjects = useHasAnyRole(SUBJECT_VIEW_ROLES);

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
              <CollapsiblePrimitive.Root defaultOpen asChild>
                <SidebarMenuItem>
                  <CollapsiblePrimitive.Trigger asChild>
                    <SidebarMenuButton
                      tooltip="Users"
                      className="[&[data-state=open]>svg:last-child]:rotate-90"
                    >
                      <Users />
                      <span>Users</span>
                      <ChevronRight className="ml-auto transition-transform duration-200" />
                    </SidebarMenuButton>
                  </CollapsiblePrimitive.Trigger>
                  <CollapsiblePrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <SidebarMenuSub>
                      {userRoles.map((role) => (
                        <SidebarMenuSubItem key={role.label}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname === role.href}
                          >
                            <NavLink to={role.href}>
                              <span>{role.label}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsiblePrimitive.Content>
                </SidebarMenuItem>
              </CollapsiblePrimitive.Root>

              {canViewSubjects && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Subjects"
                    // Also highlight on /subjects/:id detail pages.
                    isActive={location.pathname.startsWith("/subjects")}
                  >
                    <NavLink to="/subjects">
                      <BookOpen />
                      <span>Subjects</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
