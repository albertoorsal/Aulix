import type { ApiResponse } from "@/schemas/student";
import type {
  AuditAction,
  AuditLogPage,
  UpdateUserRequest,
  UserPage,
  UserResponse,
} from "@/schemas/user";
import { toApiRequestError } from "@/lib/api-error";

const API_BASE = "http://localhost:8080/api/users";

export interface SearchUsersParams {
  search?: string;
  role?: string | null;
  enabled?: boolean | null;
  page?: number;
  size?: number;
}

export interface SearchAuditLogsParams {
  userId?: string | null;
  search?: string;
  action?: AuditAction | null;
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

// ---- Users ----

export function searchRequest({
  search,
  role,
  enabled,
  page = 0,
  size = 20,
}: SearchUsersParams): Promise<UserPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: "lastName,asc",
  });
  params.append("sort", "firstName,asc");
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  if (enabled != null) params.set("enabled", String(enabled));

  return request<UserPage>(`?${params}`, { method: "GET" }, "Could not load users");
}

export function getByIdRequest(id: string): Promise<UserResponse> {
  return request<UserResponse>(`/${id}`, { method: "GET" }, "User not found");
}

export function updateRequest(id: string, body: UpdateUserRequest): Promise<UserResponse> {
  return request<UserResponse>(
    `/${id}`,
    { method: "PUT", body: JSON.stringify(body) },
    "Could not update user",
  );
}

export function deleteRequest(id: string): Promise<void> {
  return request<void>(`/${id}`, { method: "DELETE" }, "Could not delete user");
}

export function setEnabledRequest(id: string, enabled: boolean): Promise<void> {
  return request<void>(
    `/${id}/${enabled ? "enable" : "disable"}`,
    { method: "PUT" },
    enabled ? "Could not enable user" : "Could not disable user",
  );
}

export function assignRoleRequest(id: string, role: string): Promise<UserResponse> {
  return request<UserResponse>(
    `/${id}/roles/${role}`,
    { method: "POST" },
    "Could not assign role",
  );
}

export function revokeRoleRequest(id: string, role: string): Promise<UserResponse> {
  return request<UserResponse>(
    `/${id}/roles/${role}/revoke`,
    { method: "POST" },
    "Could not revoke role",
  );
}

// ---- Audit log ----

export function searchAuditLogsRequest({
  userId,
  search,
  action,
  page = 0,
  size = 20,
}: SearchAuditLogsParams): Promise<AuditLogPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: "createdAt,desc",
  });
  if (userId) params.set("userId", userId);
  if (search) params.set("search", search);
  if (action) params.set("action", action);

  return request<AuditLogPage>(
    `/audit-logs?${params}`,
    { method: "GET" },
    "Could not load the audit log",
  );
}
