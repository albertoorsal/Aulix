import type { ApiResponse } from "@/schemas/student";
import type {
  CreateParentRequest,
  LinkStudentRequest,
  ParentPage,
  ParentResponse,
  ParentStudentResponse,
  UpdateParentRequest,
} from "@/schemas/parent";
import { toApiRequestError } from "@/lib/api-error";

const API_BASE = "http://localhost:8080/api/parents";

export interface SearchParentsParams {
  search?: string;
  page?: number;
  size?: number;
}

async function request<T>(
  path: string,
  init: RequestInit,
  fallbackMessage: string,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...init,
  });

  if (!response.ok) {
    throw await toApiRequestError(response, fallbackMessage);
  }

  const body = (await response.json().catch(() => ({}))) as ApiResponse<T>;
  return body.data;
}

// ---- Parent CRUD (ADMIN / STAFF) ----

export function searchRequest({
  search,
  page = 0,
  size = 20,
}: SearchParentsParams): Promise<ParentPage> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (search) params.set("search", search);

  return request<ParentPage>(`?${params}`, { method: "GET" }, "Could not load parents");
}

export function getByIdRequest(id: string): Promise<ParentResponse> {
  return request<ParentResponse>(`/${id}`, { method: "GET" }, "Parent not found");
}

export function createRequest(body: CreateParentRequest): Promise<ParentResponse> {
  return request<ParentResponse>(
    "",
    { method: "POST", body: JSON.stringify(body) },
    "Could not create parent",
  );
}

export function updateRequest(id: string, body: UpdateParentRequest): Promise<ParentResponse> {
  return request<ParentResponse>(
    `/${id}`,
    { method: "PUT", body: JSON.stringify(body) },
    "Could not update parent",
  );
}

export function deleteRequest(id: string): Promise<void> {
  return request<void>(`/${id}`, { method: "DELETE" }, "Could not delete parent");
}

// ---- Parent ↔ student links (ADMIN / STAFF) ----

export function listLinksRequest(parentId: string): Promise<ParentStudentResponse[]> {
  return request<ParentStudentResponse[]>(
    `/${parentId}/students`,
    { method: "GET" },
    "Could not load linked students",
  );
}

export function linkStudentRequest(
  parentId: string,
  studentId: string,
  body: LinkStudentRequest,
): Promise<ParentStudentResponse> {
  return request<ParentStudentResponse>(
    `/${parentId}/students/${studentId}`,
    { method: "POST", body: JSON.stringify(body) },
    "Could not link student",
  );
}

export function updateLinkRequest(
  parentId: string,
  studentId: string,
  body: LinkStudentRequest,
): Promise<ParentStudentResponse> {
  return request<ParentStudentResponse>(
    `/${parentId}/students/${studentId}`,
    { method: "PUT", body: JSON.stringify(body) },
    "Could not update link",
  );
}

export function unlinkStudentRequest(parentId: string, studentId: string): Promise<void> {
  return request<void>(
    `/${parentId}/students/${studentId}`,
    { method: "DELETE" },
    "Could not unlink student",
  );
}

// ---- Signed-in parent (PARENT) ----

export function getMyProfileRequest(): Promise<ParentResponse> {
  return request<ParentResponse>("/me", { method: "GET" }, "Could not load your profile");
}

export function listMyChildrenRequest(): Promise<ParentStudentResponse[]> {
  return request<ParentStudentResponse[]>(
    "/me/students",
    { method: "GET" },
    "Could not load your children",
  );
}
