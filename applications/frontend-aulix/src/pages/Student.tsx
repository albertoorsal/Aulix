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
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import AddStudent from "@/components/AddStudent"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { searchStudents } from "../features/students/studentSlice"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

export default function Student() {
    const dispatch = useAppDispatch();
    const { students, status, initialized, error, page, totalPages, totalElements } = useAppSelector(
        (state) => state.students
    );
    const [searchKeyword, setSearchKeyword] = useState("")

    useEffect(() => {
        dispatch(searchStudents({ search: searchKeyword, page: 0 }));
    }, [])

    function handleSearch(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        dispatch(searchStudents({ search: searchKeyword, page: 0 }));
    }

    function goToPage(nextPage: number) {
        if (nextPage < 0 || nextPage >= totalPages) return;
        dispatch(searchStudents({ search: searchKeyword, page: nextPage }));
    }

    const isLoading = status === "loading";

    return (
        <DashboardLayout breadcrumb="Student">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
            </div>

            <div className="flex items-center justify-between gap-3">
                <form onSubmit={handleSearch} className="flex flex-1 max-w-sm items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="Search students..."
                            className="pl-8"
                        />
                    </div>
                    <Button type="submit" variant="secondary" disabled={isLoading}>
                        Search
                    </Button>
                </form>
                <AddStudent />
            </div>

            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>All students</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 border-b pb-2 text-xs font-medium text-muted-foreground">
                        <span>Name</span>
                        <span>#Number</span>
                        <span>Status</span>
                        <span className="text-right">Actions</span>
                    </div>

                    {isLoading || !initialized ? (
                        Array.from({ length: 6 }).map((_, i) => (
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
                        ))
                    ) : error ? (
                        <p className="py-6 text-center text-sm text-destructive">{error}</p>
                    ) : students.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            No students found.
                        </p>
                    ) : (
                        students.map((student) => (
                            <div
                                key={student.id}
                                className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-4"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                        {student.firstName} {student.lastName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {student.emailName}
                                    </span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {student.studentNumber}
                                </span>
                                <Badge variant="outline" className="w-fit capitalize">
                                    {student.enrollmentStatus.toLowerCase()}
                                </Badge>
                                <div className="flex justify-end">
                                    <Button variant="ghost" size="sm">
                                        View
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}

                    {!isLoading && initialized && totalPages > 1 && (
                        <div className="flex items-center justify-between border-t pt-3">
                            <span className="text-xs text-muted-foreground">
                                Page {page + 1} of {totalPages} &middot; {totalElements} students
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(page - 1)}
                                    disabled={page <= 0}
                                >
                                    <ChevronLeft className="size-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(page + 1)}
                                    disabled={page >= totalPages - 1}
                                >
                                    Next
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </DashboardLayout>
    )
}
