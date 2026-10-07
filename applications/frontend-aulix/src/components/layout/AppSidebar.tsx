import { BookOpen, ChevronRight, GraduationCap, HeartHandshake, Users } from "lucide-react";
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
import { selectRoles } from "@/features/auth/authSlice";
import { useAppSelector } from "@/store/hooks";
import { SUBJECT_VIEW_ROLES } from "@/schemas/subject";
import { ADMIN_ROLES } from "@/schemas/user";
import { PARENT_MANAGE_ROLES, PARENT_PORTAL_ROLES } from "@/schemas/parent";

const userRoles = [
  { label: "Student", href: "/students" },
  { label: "Staff", href: "/staff" },
  { label: "Admin", href: "/admin", roles: ADMIN_ROLES },
  { label: "Teacher", href: "/teachers" },
  { label: "Parent", href: "/parents", roles: PARENT_MANAGE_ROLES },
];

// Entries with nested pages (/admin/users/:id, /parents/:id) stay active on those pages too.
const PREFIX_MATCH = new Set(["/admin", "/parents"]);

export function AppSidebar() {
  const location = useLocation();
  const roles = useAppSelector(selectRoles);
  const canViewSubjects = useHasAnyRole(SUBJECT_VIEW_ROLES);
  const isParent = useHasAnyRole(PARENT_PORTAL_ROLES);

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
                      {userRoles
                        .filter((role) => !role.roles || role.roles.some((r) => roles.includes(r)))
                        .map((role) => (
                          <SidebarMenuSubItem key={role.label}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={
                                PREFIX_MATCH.has(role.href)
                                  ? location.pathname.startsWith(role.href)
                                  : location.pathname === role.href
                              }
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

              {isParent && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="My children"
                    isActive={location.pathname === "/my-children"}
                  >
                    <NavLink to="/my-children">
                      <HeartHandshake />
                      <span>My children</span>
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
