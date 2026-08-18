import type { PageResponse } from "@/schemas/student";

export type StaffType = "ADMINISTRATIVE" | "SUPPORT" | "MAINTENANCE";

export type EmploymentStatus = "ACTIVE" | "ON_LEAVE" | "SUSPENDED" | "TERMINATED";

export const STAFF_TYPES: StaffType[] = [
  "ADMINISTRATIVE",
  "SUPPORT",
  "MAINTENANCE",
];

export interface CreateStaffRequest {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  staffType: StaffType;
  hireDate: string;
  department: string;
  jobTitle: string;
  salary: number;
  curp: string;
  password: string;
}

export interface UpdateStaffRequest {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  staffType: StaffType;
  department: string;
  jobTitle: string;
  salary: number;
}

export interface StaffResponse {
  id: string;
  userId: string;
  employeeNumber: string;
  dateOfBirth: string;
  employmentStatus: EmploymentStatus;
  staffType: StaffType;
  hireDate: string;
  department: string;
  jobTitle: string;
  salary: number;
  curp: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface StaffSearchResponse {
  success: boolean;
  data: PageResponse<StaffResponse>;
  message: string | null;
  timestamp: string;
  error: string | null;
}
