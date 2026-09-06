import type { PageResponse } from "@/schemas/student";

export type TeacherType = "FULL_TIME" | "PART_TIME" | "SUBSTITUTE";

export type EmploymentStatus = "ACTIVE" | "ON_LEAVE" | "SUSPENDED" | "TERMINATED";

export const TEACHER_TYPES: TeacherType[] = [
  "FULL_TIME",
  "PART_TIME",
  "SUBSTITUTE",
];

export interface CreateTeacherRequest {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  teacherType: TeacherType;
  hireDate: string;
  department: string;
  subjectSpecialization: string;
  salary: number;
  curp: string;
  password: string;
}

export interface UpdateTeacherRequest {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  teacherType: TeacherType;
  department: string;
  subjectSpecialization: string;
  salary: number;
}

export interface TeacherResponse {
  id: string;
  userId: string;
  employeeNumber: string;
  dateOfBirth: string;
  employmentStatus: EmploymentStatus;
  teacherType: TeacherType;
  hireDate: string;
  department: string;
  subjectSpecialization: string;
  salary: number;
  curp: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface TeacherSearchResponse {
  success: boolean;
  data: PageResponse<TeacherResponse>;
  message: string | null;
  timestamp: string;
  error: string | null;
}
