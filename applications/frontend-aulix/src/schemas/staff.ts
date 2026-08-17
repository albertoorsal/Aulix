import type { PageResponse } from "@/schemas/student";

export interface StaffResponse {
  id: string;
  userId: string;
  employeeNumber: string;
  staffType: string;
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
