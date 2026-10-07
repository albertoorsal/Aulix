import {
  createRequest,
  deleteRequest,
  getByIdRequest,
  getMyProfileRequest,
  linkStudentRequest,
  listLinksRequest,
  listMyChildrenRequest,
  searchRequest,
  unlinkStudentRequest,
  updateLinkRequest,
  updateRequest,
  type SearchParentsParams,
} from "@/apis/parents";
import { listByStudentRequest } from "@/apis/subjects";
import { ApiRequestError, toErrorPayload, type ApiErrorPayload } from "@/lib/api-error";
import type {
  CreateParentRequest,
  LinkStudentRequest,
  ParentPage,
  ParentResponse,
  ParentStudentResponse,
  UpdateParentRequest,
} from "@/schemas/parent";
import type { SubjectResponse } from "@/schemas/subject";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const PAGE_SIZE = 20;

type LoadStatus = "idle" | "loading" | "failed";

interface LinksState {
  items: ParentStudentResponse[];
  status: LoadStatus;
  error: string | null;
  // requestId of the latest fetch, so a slow response for a previously viewed parent
  // can't overwrite the current one.
  requestId: string | null;
}

interface ChildSubjectsState {
  items: SubjectResponse[];
  status: LoadStatus;
  error: string | null;
}

interface ParentState {
  // List page (ADMIN / STAFF)
  parents: ParentResponse[];
  status: LoadStatus;
  initialized: boolean;
  error: string | null;
  search: string;
  page: number;
  totalPages: number;
  totalElements: number;

  // Detail page (ADMIN / STAFF)
  current: ParentResponse | null;
  currentStatus: LoadStatus;
  currentError: ApiErrorPayload | null;
  links: LinksState;

  // "My children" portal (PARENT)
  myProfile: ParentResponse | null;
  myChildren: ParentStudentResponse[];
  myChildrenStatus: LoadStatus;
  myChildrenError: string | null;
  myChildrenInitialized: boolean;
  childSubjects: Record<string, ChildSubjectsState>;
}

const emptyLinks: LinksState = { items: [], status: "idle", error: null, requestId: null };

const initialState: ParentState = {
  parents: [],
  status: "idle",
  initialized: false,
  error: null,
  search: "",
  page: 0,
  totalPages: 0,
  totalElements: 0,

  current: null,
  currentStatus: "idle",
  currentError: null,
  links: emptyLinks,

  myProfile: null,
  myChildren: [],
  myChildrenStatus: "idle",
  myChildrenError: null,
  myChildrenInitialized: false,
  childSubjects: {},
};

type ThunkConfig = { rejectValue: ApiErrorPayload };

// ---- Parent CRUD ----

export const searchParents = createAsyncThunk<ParentPage, SearchParentsParams, ThunkConfig>(
  "parents/search",
  async (params, { rejectWithValue }) => {
    try {
      return await searchRequest({ size: PAGE_SIZE, ...params });
    } catch (err) {
      return rejectWithValue(toErrorPayload(err, "Could not load parents"));
    }
  },
);

export const fetchParent = createAsyncThunk<ParentResponse, string, ThunkConfig>(
  "parents/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      return await getByIdRequest(id);
    } catch (err) {
      return rejectWithValue(toErrorPayload(err, "Parent not found"));
    }
  },
);

export const addParent = createAsyncThunk<ParentResponse, CreateParentRequest, ThunkConfig>(
  "parents/create",
  async (body, { rejectWithValue }) => {
    try {
      return await createRequest(body);
    } catch (err) {
      return rejectWithValue(toErrorPayload(err, "Could not create parent"));
    }
  },
);

export const updateParent = createAsyncThunk<
  ParentResponse,
  { id: string; body: UpdateParentRequest },
  ThunkConfig
>("parents/update", async ({ id, body }, { rejectWithValue }) => {
  try {
    return await updateRequest(id, body);
  } catch (err) {
    return rejectWithValue(toErrorPayload(err, "Could not update parent"));
  }
});

export const deleteParent = createAsyncThunk<string, string, ThunkConfig>(
  "parents/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteRequest(id);
      return id;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err, "Could not delete parent"));
    }
  },
);

// ---- Links ----

export const fetchParentLinks = createAsyncThunk<ParentStudentResponse[], string, ThunkConfig>(
  "parents/fetchLinks",
  async (parentId, { rejectWithValue }) => {
    try {
      return await listLinksRequest(parentId);
    } catch (err) {
      return rejectWithValue(toErrorPayload(err, "Could not load linked students"));
    }
  },
);

export const linkStudent = createAsyncThunk<
  ParentStudentResponse,
  { parentId: string; studentId: string; body: LinkStudentRequest },
  ThunkConfig
>("parents/link", async ({ parentId, studentId, body }, { rejectWithValue }) => {
  try {
    return await linkStudentRequest(parentId, studentId, body);
  } catch (err) {
    return rejectWithValue(toErrorPayload(err, "Could not link student"));
  }
});

export const updateLink = createAsyncThunk<
  ParentStudentResponse,
  { parentId: string; studentId: string; body: LinkStudentRequest },
  ThunkConfig
>("parents/updateLink", async ({ parentId, studentId, body }, { rejectWithValue }) => {
  try {
    return await updateLinkRequest(parentId, studentId, body);
  } catch (err) {
    return rejectWithValue(toErrorPayload(err, "Could not update link"));
  }
});

export const unlinkStudent = createAsyncThunk<
  { parentId: string; studentId: string },
  { parentId: string; studentId: string },
  ThunkConfig
>("parents/unlink", async ({ parentId, studentId }, { rejectWithValue }) => {
  try {
    await unlinkStudentRequest(parentId, studentId);
    return { parentId, studentId };
  } catch (err) {
    return rejectWithValue(toErrorPayload(err, "Could not unlink student"));
  }
});

// ---- "My children" portal ----

export const fetchMyChildren = createAsyncThunk<
  { profile: ParentResponse | null; children: ParentStudentResponse[] },
  void,
  ThunkConfig
>("parents/fetchMyChildren", async (_, { rejectWithValue }) => {
  try {
    const [profile, children] = await Promise.all([
      // A PARENT account without a parent record (e.g. the role was assigned by hand) has no
      // profile yet; that's an empty portal, not an error.
      getMyProfileRequest().catch((err: unknown) => {
        if (err instanceof ApiRequestError && err.status === 404) return null;
        throw err;
      }),
      listMyChildrenRequest(),
    ]);
    return { profile, children };
  } catch (err) {
    return rejectWithValue(toErrorPayload(err, "Could not load your children"));
  }
});

export const fetchChildSubjects = createAsyncThunk<SubjectResponse[], string, ThunkConfig>(
  "parents/fetchChildSubjects",
  async (studentId, { rejectWithValue }) => {
    try {
      return await listByStudentRequest(studentId);
    } catch (err) {
      return rejectWithValue(toErrorPayload(err, "Could not load enrolled subjects"));
    }
  },
);

function replaceLink(links: ParentStudentResponse[], updated: ParentStudentResponse) {
  return links.map((link) => {
    if (link.studentId === updated.studentId) {
      // The update response may lack student details if student-service hiccuped; keep ours.
      return { ...updated, student: updated.student ?? link.student };
    }
    // A student has one primary contact; promoting this link demotes the others in our copy.
    return updated.primaryContact ? { ...link, primaryContact: false } : link;
  });
}

const parentSlice = createSlice({
  name: "parents",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(searchParents.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.search = action.meta.arg.search ?? "";
      })
      .addCase(searchParents.fulfilled, (state, action) => {
        state.status = "idle";
        state.initialized = true;
        state.parents = action.payload.content;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(searchParents.rejected, (state, action) => {
        state.status = "failed";
        state.initialized = true;
        state.error = action.payload?.message ?? "Retrieving data failed";
      })

      .addCase(fetchParent.pending, (state, action) => {
        state.currentStatus = "loading";
        state.currentError = null;
        if (state.current?.id !== action.meta.arg) {
          state.current = null;
          state.links = emptyLinks;
        }
      })
      .addCase(fetchParent.fulfilled, (state, action) => {
        state.currentStatus = "idle";
        state.current = action.payload;
      })
      .addCase(fetchParent.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.currentError = action.payload ?? { message: "Parent not found" };
      })

      .addCase(updateParent.fulfilled, (state, action) => {
        const index = state.parents.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.parents[index] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
      })
      .addCase(deleteParent.fulfilled, (state, action) => {
        state.parents = state.parents.filter((p) => p.id !== action.payload);
        state.totalElements = Math.max(0, state.totalElements - 1);
        if (state.current?.id === action.payload) state.current = null;
      })

      .addCase(fetchParentLinks.pending, (state, action) => {
        state.links.status = "loading";
        state.links.error = null;
        state.links.requestId = action.meta.requestId;
      })
      .addCase(fetchParentLinks.fulfilled, (state, action) => {
        if (state.links.requestId !== action.meta.requestId) return;
        state.links.status = "idle";
        state.links.items = action.payload;
      })
      .addCase(fetchParentLinks.rejected, (state, action) => {
        if (state.links.requestId !== action.meta.requestId) return;
        state.links.status = "failed";
        state.links.error = action.payload?.message ?? "Could not load linked students";
      })

      .addCase(linkStudent.fulfilled, (state, action) => {
        if (state.current?.id !== action.payload.parentId) return;
        const others = action.payload.primaryContact
          ? state.links.items.map((l) => ({ ...l, primaryContact: false }))
          : state.links.items;
        state.links.items = [...others, action.payload];
        state.current.childCount += 1;
      })
      .addCase(updateLink.fulfilled, (state, action) => {
        if (state.current?.id !== action.payload.parentId) return;
        state.links.items = replaceLink(state.links.items, action.payload);
      })
      .addCase(unlinkStudent.fulfilled, (state, action) => {
        if (state.current?.id !== action.payload.parentId) return;
        state.links.items = state.links.items.filter(
          (l) => l.studentId !== action.payload.studentId,
        );
        state.current.childCount = Math.max(0, state.current.childCount - 1);
      })

      .addCase(fetchMyChildren.pending, (state) => {
        state.myChildrenStatus = "loading";
        state.myChildrenError = null;
      })
      .addCase(fetchMyChildren.fulfilled, (state, action) => {
        state.myChildrenStatus = "idle";
        state.myChildrenInitialized = true;
        state.myProfile = action.payload.profile;
        state.myChildren = action.payload.children;
      })
      .addCase(fetchMyChildren.rejected, (state, action) => {
        state.myChildrenStatus = "failed";
        state.myChildrenInitialized = true;
        state.myChildrenError = action.payload?.message ?? "Could not load your children";
      })

      .addCase(fetchChildSubjects.pending, (state, action) => {
        const previous = state.childSubjects[action.meta.arg];
        state.childSubjects[action.meta.arg] = {
          items: previous?.items ?? [],
          status: "loading",
          error: null,
        };
      })
      .addCase(fetchChildSubjects.fulfilled, (state, action) => {
        state.childSubjects[action.meta.arg] = {
          items: action.payload,
          status: "idle",
          error: null,
        };
      })
      .addCase(fetchChildSubjects.rejected, (state, action) => {
        state.childSubjects[action.meta.arg] = {
          items: [],
          status: "failed",
          error: action.payload?.message ?? "Could not load enrolled subjects",
        };
      });
  },
});

export const PAGE_SIZE_DEFAULT = PAGE_SIZE;
export const { clearError } = parentSlice.actions;

export default parentSlice.reducer;
