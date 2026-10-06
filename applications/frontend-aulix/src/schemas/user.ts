import type { PageResponse } from "@/schemas/student";

// Mirrors security-starter's Roles constants.
export const ROLES = ["ADMIN", "STAFF", "TEACHER", "PARENT", "STUDENT"] as const;
export type RoleName = (typeof ROLES)[number];

export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  ADMIN: "Full administrative access, including this module",
  STAFF: "Manages students, staff, subjects and enrollments",
  TEACHER: "Views subjects and the students enrolled in them",
  PARENT: "Parent or guardian of a student",
  STUDENT: "Student account",
};

// Mirrors auth-service's UserController: /api/users admin endpoints are ADMIN-only.
export const ADMIN_ROLES = ["ADMIN"];

// Column limits from auth-service's V1 migration.
export const USER_NAME_MAX = 100;
export const USER_EMAIL_MAX = 255;

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  roles: string[];
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export type UserPage = PageResponse<UserResponse>;

export type AuditAction =
  | "ROLE_ASSIGNED"
  | "ROLE_REVOKED"
  | "USER_ENABLED"
  | "USER_DISABLED"
  | "USER_UPDATED"
  | "USER_DELETED";

export const AUDIT_ACTIONS: AuditAction[] = [
  "ROLE_ASSIGNED",
  "ROLE_REVOKED",
  "USER_ENABLED",
  "USER_DISABLED",
  "USER_UPDATED",
  "USER_DELETED",
];

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  ROLE_ASSIGNED: "Role assigned",
  ROLE_REVOKED: "Role revoked",
  USER_ENABLED: "User enabled",
  USER_DISABLED: "User disabled",
  USER_UPDATED: "User updated",
  USER_DELETED: "User deleted",
};

export interface AuditLogResponse {
  id: string;
  action: AuditAction;
  actorId: string | null;
  actorEmail: string | null;
  targetUserId: string;
  targetEmail: string;
  details: string | null;
  createdAt: string;
}

export type AuditLogPage = PageResponse<AuditLogResponse>;
