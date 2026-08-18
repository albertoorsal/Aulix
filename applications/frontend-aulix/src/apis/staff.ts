import type {
  CreateStaffRequest,
  StaffResponse,
  StaffSearchResponse,
  UpdateStaffRequest,
} from "@/schemas/staff";
import type { ApiResponse, PageResponse } from "@/schemas/student";

const API_BASE = "http://localhost:8080/api/staff";

export interface SearchStaffParams {
  search?: string;
  page?: number;
  size?: number;
}

export async function searchRequest({
  search,
  page = 0,
  size = 20,
}: SearchStaffParams): Promise<PageResponse<StaffResponse>> {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };

  if (search) {
    params.search = search;
  }

  const queryString = new URLSearchParams(params).toString();

  const response = await fetch(`${API_BASE}?${queryString}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Not rows");
  }

  const body = (await response.json()) as StaffSearchResponse;
  return body.data;
}

export async function createRequest(
  request: CreateStaffRequest,
): Promise<void> {
  const response = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Invalid create");
  }
}

export async function updateRequest(
  id: string,
  request: UpdateStaffRequest,
): Promise<StaffResponse> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Invalid update");
  }

  const body = (await response.json()) as ApiResponse<StaffResponse>;
  return body.data;
}

export async function deleteRequest(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Delete failed");
  }
}
