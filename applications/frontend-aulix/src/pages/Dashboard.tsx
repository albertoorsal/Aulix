import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const roleSummary = [
    { role: "Admin", count: 3 },
    { role: "Staff", count: 12 },
    { role: "Teacher", count: 28 },
    { role: "Parent", count: 154 },
]

export function Dashboard() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
                <p className="text-sm text-muted-foreground">
                    Manage every account across the school by role.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {roleSummary.map((item) => (
                    <Card key={item.role}>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                                {item.role}
                                <Badge variant="secondary">{item.count}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-6 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>All users</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 border-b pb-2 text-xs font-medium text-muted-foreground">
                        <span>Name</span>
                        <span>Role</span>
                        <span>Status</span>
                        <span className="text-right">Actions</span>
                    </div>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-4"
                        >
                            <div className="flex items-center gap-3">
                                <Skeleton className="size-8 rounded-full" />
                                <div className="flex flex-col gap-1">
                                    <Skeleton className="h-3.5 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-5 w-14 rounded-full" />
                            <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </DashboardLayout>
    )
}
