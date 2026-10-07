import type { PageResponse } from "@/schemas/student";

// Mirrors parent-service's @PreAuthorize rules.
export const PARENT_MANAGE_ROLES = ["ADMIN", "STAFF"];
export const PARENT_PORTAL_ROLES = ["PARENT"];

export type Relationship = "MOTHER" | "FATHER" | "GUARDIAN" | "OTHER";

export const RELATIONSHIPS: Relationship[] = ["MOTHER", "FATHER", "GUARDIAN", "OTHER"];

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  MOTHER: "Mother",
  FATHER: "Father",
  GUARDIAN: "Guardian",
  OTHER: "Other",
};

// Column limits from parent-service's V1 migration and auth-service's users table.
export const PARENT_NAME_MAX = 100;
export const PARENT_EMAIL_MAX = 255;
export const PARENT_PHONE_MAX = 30;
export const PARENT_PASSWORD_MIN = 8;
export const PARENT_PASSWORD_MAX = 100;

export interface CreateParentRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  password: string;
}

export interface UpdateParentRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export interface ParentResponse {
  id: string;
  userId: string;
  phone: string | null;
  childCount: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

export interface LinkStudentRequest {
  relationship: Relationship;
  primaryContact: boolean;
}

export interface StudentSummary {
  id: string;
  studentNumber: string;
  dateOfBirth: string | null;
  enrollmentStatus: string;
  gradeLevel: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

export interface ParentStudentResponse {
  id: string;
  parentId: string;
  studentId: string;
  relationship: Relationship;
  primaryContact: boolean;
  // Null when the student record couldn't be loaded (e.g. deleted since it was linked).
  student: StudentSummary | null;
}

export type ParentPage = PageResponse<ParentResponse>;

export function parentName(parent: Pick<ParentResponse, "firstName" | "lastName">): string {
  const name = `${parent.firstName ?? ""} ${parent.lastName ?? ""}`.trim();
  return name || "Unknown parent";
}

export function studentName(link: ParentStudentResponse): string {
  const name = `${link.student?.firstName ?? ""} ${link.student?.lastName ?? ""}`.trim();
  return name || "Unknown student";
}
