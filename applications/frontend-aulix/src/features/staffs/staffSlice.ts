import {
  createRequest,
  deleteRequest,
  searchRequest,
  updateRequest,
  type SearchStaffParams,
} from "@/apis/staff";
import type {
  CreateStaffRequest,
  StaffResponse,
  UpdateStaffRequest,
} from "@/schemas/staff";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const PAGE_SIZE = 20;

interface StaffState {
  staffs: StaffResponse[];
  status: "idle" | "loading" | "failed";
  initialized: boolean;
  error: string | null;
  search: string;
  page: number;
  totalPages: number;
  totalElements: number;
}

const initialState: StaffState = {
  staffs: [],
  status: "idle",
  initialized: false,
  error: null,
  search: "",
  page: 0,
  totalPages: 0,
  totalElements: 0,
};

export const searchStaffs = createAsyncThunk(
  "staffs/search",
  async (params: SearchStaffParams, { rejectWithValue }) => {
    try {
      return await searchRequest(params);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : null);
    }
  },
);

export const addStaff = createAsyncThunk(
  "staffs/create",
  async (body: CreateStaffRequest, { rejectWithValue }) => {
    try {
      await createRequest(body);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Create failed";
      return rejectWithValue(message);
    }
  },
);

export const updateStaff = createAsyncThunk(
  "staffs/update",
  async (
    { id, body }: { id: string; body: UpdateStaffRequest },
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

export const deleteStaff = createAsyncThunk(
  "staffs/delete",
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

const staffSlice = createSlice({
  name: "staffs",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(searchStaffs.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.search = action.meta.arg.search ?? "";
      })
      .addCase(searchStaffs.fulfilled, (state, action) => {
        state.status = "idle";
        state.initialized = true;
        state.staffs = action.payload.content;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(searchStaffs.rejected, (state, action) => {
        state.status = "failed";
        state.initialized = true;
        state.error = (action.payload as string) ?? "Retrieving data failed";
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        const index = state.staffs.findIndex(
          (staff) => staff.id === action.payload.id,
        );
        if (index !== -1) {
          state.staffs[index] = action.payload;
        }
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.staffs = state.staffs.filter(
          (staff) => staff.id !== action.payload,
        );
        state.totalElements = Math.max(0, state.totalElements - 1);
      });
  },
});

export const PAGE_SIZE_DEFAULT = PAGE_SIZE;
export const { clearError } = staffSlice.actions;

export default staffSlice.reducer;
