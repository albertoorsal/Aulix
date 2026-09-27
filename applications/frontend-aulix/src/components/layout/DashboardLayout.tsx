import { Fragment, type ReactNode } from "react"
import { Link } from "react-router"
import { LogOut, Settings, User } from "lucide-react"

import { AppSidebar } from "@/components/layout/AppSidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

export interface BreadcrumbEntry {
    label: string
    href?: string
}

export function DashboardLayout({
    children,
    breadcrumb = "Users",
    breadcrumbs,
}: {
    children: ReactNode
    breadcrumb?: string
    // Full trail after "Dashboard"; the last entry is the current page. Overrides `breadcrumb`.
    breadcrumbs?: BreadcrumbEntry[]
}) {
    const trail = breadcrumbs ?? [{ label: breadcrumb }]

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link to="/dashboard">Dashboard</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                {trail.map((entry, i) => (
                                    <Fragment key={`${entry.label}-${i}`}>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            {i < trail.length - 1 && entry.href ? (
                                                <BreadcrumbLink asChild>
                                                    <Link to={entry.href}>{entry.label}</Link>
                                                </BreadcrumbLink>
                                            ) : (
                                                <BreadcrumbPage>{entry.label}</BreadcrumbPage>
                                            )}
                                        </BreadcrumbItem>
                                    </Fragment>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 rounded-md p-1 outline-none hover:bg-accent">
                                <Avatar className="size-8">
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive">
                                <LogOut />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    )
}
