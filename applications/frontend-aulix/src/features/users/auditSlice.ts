import { searchAuditLogsRequest, type SearchAuditLogsParams } from "@/apis/users";
import { toErrorPayload, type ApiErrorPayload } from "@/lib/api-error";
import type { AuditAction, AuditLogPage, AuditLogResponse } from "@/schemas/user";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const PAGE_SIZE = 20;

type LoadStatus = "idle" | "loading" | "failed";

// The audit page and a user's "Activity" tab read the same endpoint with different filters,
// so each keeps its own list (switching between them must not clobber the other's filters).
export type AuditView = "log" | "activity";

interface AuditListState {
  items: AuditLogResponse[];
  status: LoadStatus;
  initialized: boolean;
  error: string | null;
  userId: string | null;
  search: string;
  action: AuditAction | null;
  page: number;
  totalPages: number;
  totalElements: number;
  // requestId of the latest fetch, so a slow response can't overwrite a newer one.
  requestId: string | null;
}

const emptyList: AuditListState = {
  items: [],
  status: "idle",
  initialized: false,
  error: null,
  userId: null,
  search: "",
  action: null,
  page: 0,
  totalPages: 0,
  totalElements: 0,
  requestId: null,
};

const initialState: Record<AuditView, AuditListState> = {
  log: emptyList,
  activity: emptyList,
};

type ThunkConfig = { rejectValue: ApiErrorPayload };

export const searchAuditLogs = createAsyncThunk<
  AuditLogPage,
  SearchAuditLogsParams & { view: AuditView },
  ThunkConfig
>("audit/search", async ({ userId, search, action, page }, { rejectWithValue }) => {
  try {
    return await searchAuditLogsRequest({ userId, search, action, page, size: PAGE_SIZE });
  } catch (err) {
    return rejectWithValue(toErrorPayload(err, "Could not load the audit log"));
  }
});

const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(searchAuditLogs.pending, (state, action) => {
        const { view, userId, search, action: auditAction } = action.meta.arg;
        const list = state[view];
        if (view === "activity" && list.userId !== (userId ?? null)) {
          // Different user: don't flash the previous user's entries.
          list.items = [];
          list.initialized = false;
        }
        list.status = "loading";
        list.error = null;
        list.userId = userId ?? null;
        list.search = search ?? "";
        list.action = auditAction ?? null;
        list.requestId = action.meta.requestId;
      })
      .addCase(searchAuditLogs.fulfilled, (state, action) => {
        const list = state[action.meta.arg.view];
        if (list.requestId !== action.meta.requestId) return;
        list.status = "idle";
        list.initialized = true;
        list.items = action.payload.content;
        list.page = action.payload.page;
        list.totalPages = action.payload.totalPages;
        list.totalElements = action.payload.totalElements;
      })
      .addCase(searchAuditLogs.rejected, (state, action) => {
        const list = state[action.meta.arg.view];
        if (list.requestId !== action.meta.requestId) return;
        list.status = "failed";
        list.initialized = true;
        list.error = action.payload?.message ?? "Could not load the audit log";
      });
  },
});

export default auditSlice.reducer;
