import type { StaffResponse, StaffSearchResponse } from "@/schemas/staff";
import type { PageResponse } from "@/schemas/student";

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

  console.log(response);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Not rows");
  }

  const body = (await response.json()) as StaffSearchResponse;
  return body.data;
}
