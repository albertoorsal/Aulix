

export interface StudentResponse {
    id: string;
    userId: string;
    studentNumber: string;
    enrollmentStatus: string;
    curp: string;
    firstName: string;
    lastName: string;
    emailName: string;
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export interface StudentSearchResponse {
    success: boolean;
    data: PageResponse<StudentResponse>;
    message: string | null;
    timestamp: string;
    error: string | null;
}