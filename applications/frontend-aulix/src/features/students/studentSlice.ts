import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  type CreateStudentRequest,
  type StudentResponse,
  type UpdateStudentRequest,
} from "../../schemas/student";
import {
  createRequest,
  deleteRequest,
  searchRequest,
  updateRequest,
  type SearchStudentsParams,
} from "@/apis/students";

const PAGE_SIZE = 20;

interface StudentState {
  students: StudentResponse[];
  status: "idle" | "loading" | "failed";
  initialized: boolean;
  error: string | null;
  search: string;
  page: number;
  totalPages: number;
  totalElements: number;
}

const initialState: StudentState = {
  students: [],
  status: "idle",
  initialized: false,
  error: null,
  search: "",
  page: 0,
  totalPages: 0,
  totalElements: 0,
};

export const searchStudents = createAsyncThunk(
  "students/search",
  async (params: SearchStudentsParams, { rejectWithValue }) => {
    try {
      return await searchRequest(params);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : null);
    }
  },
);

export const addStudent = createAsyncThunk(
  "students/create",
  async (body: CreateStudentRequest, { rejectWithValue }) => {
    try {
      await createRequest(body);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Create failed";
      return rejectWithValue(message);
    }
  },
);

export const updateStudent = createAsyncThunk(
  "students/update",
  async (
    { id, body }: { id: string; body: UpdateStudentRequest },
    { rejectWithValue },
  ) => {
    try {
      return await updateRequest(id, body);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      return rejectWithValue(message);
    }
  },
);

export const deleteStudent = createAsyncThunk(
  "students/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteRequest(id);
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      return rejectWithValue(message);
    }
  },
);

const studentsSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(searchStudents.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.search = action.meta.arg.search ?? "";
      })
      .addCase(searchStudents.fulfilled, (state, action) => {
        state.status = "idle";
        state.initialized = true;
        state.students = action.payload.content;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(searchStudents.rejected, (state, action) => {
        state.status = "failed";
        state.initialized = true;
        state.error = (action.payload as string) ?? "Retrieving data failed";
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        const index = state.students.findIndex(
          (student) => student.id === action.payload.id,
        );
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.students = state.students.filter(
          (student) => student.id !== action.payload,
        );
        state.totalElements = Math.max(0, state.totalElements - 1);
      });
  },
});

export const PAGE_SIZE_DEFAULT = PAGE_SIZE;
export const { clearError } = studentsSlice.actions;

export default studentsSlice.reducer;
