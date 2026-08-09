export interface CreateStudentRequest {
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  enrollmentDate: string;
  gradeLevel: number;
  curp: string;
  password: string;
}

export interface UpdateStudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gradeLevel: number;
}

export interface StudentResponse {
  id: string;
  userId: string;
  studentNumber: string;
  dateOfBirth: string;
  enrollmentStatus: string;
  enrollmentDate: string;
  gradeLevel: number;
  curp: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  timestamp: string;
  error: string | null;
}

export interface StudentSearchResponse {
  success: boolean;
  data: PageResponse<StudentResponse>;
  message: string | null;
  timestamp: string;
  error: string | null;
}
