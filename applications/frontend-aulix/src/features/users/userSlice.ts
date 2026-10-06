import {
  assignRoleRequest,
  deleteRequest,
  getByIdRequest,
  revokeRoleRequest,
  searchRequest,
  setEnabledRequest,
  updateRequest,
  type SearchUsersParams,
} from "@/apis/users";
import { toErrorPayload, type ApiErrorPayload } from "@/lib/api-error";
import type { UpdateUserRequest, UserPage, UserResponse } from "@/schemas/user";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const PAGE_SIZE = 20;

type LoadStatus = "idle" | "loading" | "failed";

interface UserState {
  // List page
  users: UserResponse[];
  status: LoadStatus;
  initialized: boolean;
  error: string | null;
  search: string;
  roleFilter: string | null;
  enabledFilter: boolean | null;
  page: number;
  totalPages: number;
  totalElements: number;

  // Detail page
  current: UserResponse | null;
  currentStatus: LoadStatus;
  currentError: ApiErrorPayload | null;
}

const initialState: UserState = {
  users: [],
  status: "idle",
  initialized: false,
  error: null,
  search: "",
  roleFilter: null,
  enabledFilter: null,
  page: 0,
  totalPages: 0,
  totalElements: 0,

  current: null,
  currentStatus: "idle",
  currentError: null,
};

type ThunkConfig = { rejectValue: ApiErrorPayload };

export const searchUsers = createAsyncThunk<UserPage, SearchUsersParams, ThunkConfig>(
  "users/search",
  async (params, { rejectWithValue }) => {
    try {
      return await searchRequest({ size: PAGE_SIZE, ...params });
    } catch (err) {
      return rejectWithValue(toErrorPayload(err, "Could not load users"));
    }
  },
);

export const fetchUser = createAsyncThunk<UserResponse, string, ThunkConfig>(
  "users/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      return await getByIdRequest(id);
    } catch (err) {
      return rejectWithValue(toErrorPayload(err, "User not found"));
    }
  },
);

export const updateUser = createAsyncThunk<
  UserResponse,
  { id: string; body: UpdateUserRequest },
  ThunkConfig
>("users/update", async ({ id, body }, { rejectWithValue }) => {
  try {
    return await updateRequest(id, body);
  } catch (err) {
    return rejectWithValue(toErrorPayload(err, "Could not update user"));
  }
});

export const deleteUser = createAsyncThunk<string, string, ThunkConfig>(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteRequest(id);
      return id;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err, "Could not delete user"));
    }
  },
);

export const setUserEnabled = createAsyncThunk<
  { id: string; enabled: boolean },
  { id: string; enabled: boolean },
  ThunkConfig
>("users/setEnabled", async ({ id, enabled }, { rejectWithValue }) => {
  try {
    await setEnabledRequest(id, enabled);
    return { id, enabled };
  } catch (err) {
    return rejectWithValue(
      toErrorPayload(err, enabled ? "Could not enable user" : "Could not disable user"),
    );
  }
});

export const changeUserRole = createAsyncThunk<
  UserResponse,
  { id: string; role: string; assign: boolean },
  ThunkConfig
>("users/changeRole", async ({ id, role, assign }, { rejectWithValue }) => {
  try {
    return assign ? await assignRoleRequest(id, role) : await revokeRoleRequest(id, role);
  } catch (err) {
    return rejectWithValue(
      toErrorPayload(err, assign ? "Could not assign role" : "Could not revoke role"),
    );
  }
});

function replaceUser(state: UserState, user: UserResponse) {
  const index = state.users.findIndex((u) => u.id === user.id);
  if (index !== -1) state.users[index] = user;
  if (state.current?.id === user.id) state.current = user;
}

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.search = action.meta.arg.search ?? "";
        state.roleFilter = action.meta.arg.role ?? null;
        state.enabledFilter = action.meta.arg.enabled ?? null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.status = "idle";
        state.initialized = true;
        state.users = action.payload.content;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.initialized = true;
        state.error = action.payload?.message ?? "Retrieving data failed";
      })

      .addCase(fetchUser.pending, (state, action) => {
        state.currentStatus = "loading";
        state.currentError = null;
        if (state.current?.id !== action.meta.arg) state.current = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.currentStatus = "idle";
        state.current = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.currentError = action.payload ?? { message: "User not found" };
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        replaceUser(state, action.payload);
      })
      .addCase(changeUserRole.fulfilled, (state, action) => {
        replaceUser(state, action.payload);
      })
      .addCase(setUserEnabled.fulfilled, (state, action) => {
        const { id, enabled } = action.payload;
        const user = state.users.find((u) => u.id === id);
        if (user) user.enabled = enabled;
        if (state.current?.id === id) state.current.enabled = enabled;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
        state.totalElements = Math.max(0, state.totalElements - 1);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const PAGE_SIZE_DEFAULT = PAGE_SIZE;

export default userSlice.reducer;
