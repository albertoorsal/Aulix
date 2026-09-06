import {
  createRequest,
  deleteRequest,
  searchRequest,
  updateRequest,
  type SearchTeacherParams,
} from "@/apis/teachers";
import type {
  CreateTeacherRequest,
  TeacherResponse,
  UpdateTeacherRequest,
} from "@/schemas/teacher";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const PAGE_SIZE = 20;

interface TeacherState {
  teachers: TeacherResponse[];
  status: "idle" | "loading" | "failed";
  initialized: boolean;
  error: string | null;
  search: string;
  page: number;
  totalPages: number;
  totalElements: number;
}

const initialState: TeacherState = {
  teachers: [],
  status: "idle",
  initialized: false,
  error: null,
  search: "",
  page: 0,
  totalPages: 0,
  totalElements: 0,
};

export const searchTeachers = createAsyncThunk(
  "teachers/search",
  async (params: SearchTeacherParams, { rejectWithValue }) => {
    try {
      return await searchRequest(params);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : null);
    }
  },
);

export const addTeacher = createAsyncThunk(
  "teachers/create",
  async (body: CreateTeacherRequest, { rejectWithValue }) => {
    try {
      await createRequest(body);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Create failed";
      return rejectWithValue(message);
    }
  },
);

export const updateTeacher = createAsyncThunk(
  "teachers/update",
  async (
    { id, body }: { id: string; body: UpdateTeacherRequest },
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

export const deleteTeacher = createAsyncThunk(
  "teachers/delete",
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

const teacherSlice = createSlice({
  name: "teachers",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(searchTeachers.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.search = action.meta.arg.search ?? "";
      })
      .addCase(searchTeachers.fulfilled, (state, action) => {
        state.status = "idle";
        state.initialized = true;
        state.teachers = action.payload.content;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(searchTeachers.rejected, (state, action) => {
        state.status = "failed";
        state.initialized = true;
        state.error = (action.payload as string) ?? "Retrieving data failed";
      })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        const index = state.teachers.findIndex(
          (teacher) => teacher.id === action.payload.id,
        );
        if (index !== -1) {
          state.teachers[index] = action.payload;
        }
      })
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.teachers = state.teachers.filter(
          (teacher) => teacher.id !== action.payload,
        );
        state.totalElements = Math.max(0, state.totalElements - 1);
      });
  },
});

export const PAGE_SIZE_DEFAULT = PAGE_SIZE;
export const { clearError } = teacherSlice.actions;

export default teacherSlice.reducer;
