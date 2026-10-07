import type { ApiResponse } from "@/schemas/student";
import type {
  CreateSubjectRequest,
  StudentEnrollmentResponse,
  SubjectPage,
  SubjectResponse,
  SubjectStatus,
  TeacherAssignmentResponse,
  UpdateSubjectRequest,
} from "@/schemas/subject";
import { toApiRequestError } from "@/lib/api-error";

const API_BASE = "http://localhost:8080/api/subjects";

export interface SearchSubjectsParams {
  search?: string;
  status?: SubjectStatus | null;
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

// ---- Subject CRUD ----

export function searchRequest({
  search,
  status,
  page = 0,
  size = 20,
}: SearchSubjectsParams): Promise<SubjectPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: "name,asc",
  });
  if (search) params.set("search", search);
  if (status) params.set("status", status);

  return request<SubjectPage>(`?${params}`, { method: "GET" }, "Could not load subjects");
}

export function getByIdRequest(id: string): Promise<SubjectResponse> {
  return request<SubjectResponse>(`/${id}`, { method: "GET" }, "Subject not found");
}

// Subjects a student is enrolled in. A PARENT may call this for their own children only.
export function listByStudentRequest(studentId: string): Promise<SubjectResponse[]> {
  return request<SubjectResponse[]>(
    `/students/${studentId}`,
    { method: "GET" },
    "Could not load enrolled subjects",
  );
}

export function createRequest(body: CreateSubjectRequest): Promise<SubjectResponse> {
  return request<SubjectResponse>(
    "",
    { method: "POST", body: JSON.stringify(body) },
    "Could not create subject",
  );
}

export function updateRequest(
  id: string,
  body: UpdateSubjectRequest,
): Promise<SubjectResponse> {
  return request<SubjectResponse>(
    `/${id}`,
    { method: "PUT", body: JSON.stringify(body) },
    "Could not update subject",
  );
}

export function deleteRequest(id: string): Promise<void> {
  return request<void>(`/${id}`, { method: "DELETE" }, "Could not delete subject");
}

// ---- Teacher assignment ----

export function listTeachersRequest(subjectId: string): Promise<TeacherAssignmentResponse[]> {
  return request<TeacherAssignmentResponse[]>(
    `/${subjectId}/teachers`,
    { method: "GET" },
    "Could not load assigned teachers",
  );
}

export function assignTeacherRequest(
  subjectId: string,
  teacherId: string,
): Promise<TeacherAssignmentResponse> {
  return request<TeacherAssignmentResponse>(
    `/${subjectId}/teachers/${teacherId}`,
    { method: "POST" },
    "Could not assign teacher",
  );
}

export function unassignTeacherRequest(subjectId: string, teacherId: string): Promise<void> {
  return request<void>(
    `/${subjectId}/teachers/${teacherId}`,
    { method: "DELETE" },
    "Could not remove teacher",
  );
}

// ---- Student enrollment ----

export function listStudentsRequest(subjectId: string): Promise<StudentEnrollmentResponse[]> {
  return request<StudentEnrollmentResponse[]>(
    `/${subjectId}/students`,
    { method: "GET" },
    "Could not load enrolled students",
  );
}

export function enrollStudentRequest(
  subjectId: string,
  studentId: string,
): Promise<StudentEnrollmentResponse> {
  return request<StudentEnrollmentResponse>(
    `/${subjectId}/students/${studentId}`,
    { method: "POST" },
    "Could not enroll student",
  );
}

export function unenrollStudentRequest(subjectId: string, studentId: string): Promise<void> {
  return request<void>(
    `/${subjectId}/students/${studentId}`,
    { method: "DELETE" },
    "Could not remove student",
  );
}
