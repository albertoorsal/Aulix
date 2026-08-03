import type { PageResponse, StudentResponse, StudentSearchResponse } from "../schemas/student"

const API_BASE = "http://localhost:8080/api/students";

export interface SearchStudentsParams {
    search?: string;
    page?: number;
    size?: number;
}

export async function searchRequest({ search, page = 0, size = 20 }: SearchStudentsParams): Promise<PageResponse<StudentResponse>> {
    const params: Record<string, string> = {
        page: String(page),
        size: String(size),
    }
    if (search) {
        params.search = search;
    }
    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`${API_BASE}?${queryString}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    })

    console.log(response);
    

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Not rows")
    }

    const body = (await response.json()) as StudentSearchResponse;
    return body.data;
}
