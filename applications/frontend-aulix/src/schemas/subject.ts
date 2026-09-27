import type { PageResponse } from "@/schemas/student";

export type SubjectStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export const SUBJECT_STATUSES: SubjectStatus[] = ["ACTIVE", "INACTIVE", "ARCHIVED"];

// Mirrors subject-service's @PreAuthorize rules.
export const SUBJECT_VIEW_ROLES = ["ADMIN", "STAFF", "TEACHER"];
export const SUBJECT_EDIT_ROLES = ["ADMIN", "STAFF"];

// Column limits from subject-service's V1 migration.
export const SUBJECT_CODE_MAX = 20;
export const SUBJECT_NAME_MAX = 150;
export const SUBJECT_DESCRIPTION_MAX = 1000;

export interface CreateSubjectRequest {
  code: string;
  name: string;
  description: string | null;
  creditHours: number;
}

export interface UpdateSubjectRequest {
  name: string;
  description: string | null;
  creditHours: number;
  status: SubjectStatus;
}

export interface SubjectResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  creditHours: number;
  status: SubjectStatus;
}

export interface TeacherAssignmentResponse {
  id: string;
  subjectId: string;
  teacherId: string;
}

export interface StudentEnrollmentResponse {
  id: string;
  subjectId: string;
  studentId: string;
}

export type MemberKind = "teacher" | "student";

// An assigned teacher or enrolled student, resolved to display details. The assignment
// endpoints only return ids, so details come from teacher-/student-service lookups.
export interface SubjectMember {
  personId: string;
  name: string;
  email: string | null;
  number: string | null;
  // False when the person's record could not be loaded (e.g. deleted since assignment).
  resolved: boolean;
}

export type SubjectPage = PageResponse<SubjectResponse>;
