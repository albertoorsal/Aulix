import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import AddStudent from "@/components/AddStudent"

// const gradeSummary = [
//     { grade: "Freshman", count: 48 },
//     { grade: "Sophomore", count: 52 },
//     { grade: "Junior", count: 49 },
//     { grade: "Senior", count: 51 },
// ]

export default function Student() {
    
    return (
        <DashboardLayout breadcrumb="Student">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
            </div>

            <AddStudent />
            {/* <div className="flex">
                <Button variant="outline">New +</Button>
            </div> */}

            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>All students</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 border-b pb-2 text-xs font-medium text-muted-foreground">
                        <span>Name</span>
                        <span>Grade</span>
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
