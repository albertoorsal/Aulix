import {
  assignTeacherRequest,
  createRequest,
  deleteRequest,
  enrollStudentRequest,
  getByIdRequest,
  listStudentsRequest,
  listTeachersRequest,
  searchRequest,
  unassignTeacherRequest,
  unenrollStudentRequest,
  updateRequest,
  type SearchSubjectsParams,
} from "@/apis/subjects";
import { getByIdRequest as getTeacherRequest } from "@/apis/teachers";
import { getByIdRequest as getStudentRequest } from "@/apis/students";
import { toErrorPayload, type ApiErrorPayload } from "@/lib/api-error";
import type {
  CreateSubjectRequest,
  MemberKind,
  SubjectMember,
  SubjectPage,
  SubjectResponse,
  SubjectStatus,
  UpdateSubjectRequest,
} from "@/schemas/subject";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const PAGE_SIZE = 20;

type LoadStatus = "idle" | "loading" | "failed";

interface MembersState {
  items: SubjectMember[];
  status: LoadStatus;
  error: string | null;
  // requestId of the latest fetch, so a slow response for a previously viewed subject
  // can't overwrite the current one.
  requestId: string | null;
}

interface SubjectState {
  // List page
  subjects: SubjectResponse[];
  status: LoadStatus;
  initialized: boolean;
  error: string | null;
  search: string;
  statusFilter: SubjectStatus | null;
  page: number;
  totalPages: number;
  totalElements: number;

  // Detail page
  current: SubjectResponse | null;
  currentStatus: LoadStatus;
  currentError: ApiErrorPayload | null;
  teachers: MembersState;
  students: MembersState;
}

const emptyMembers: MembersState = {
  items: [],
  status: "idle",
  error: null,
  requestId: null,
};

const initialState: SubjectState = {
  subjects: [],
  status: "idle",
  initialized: false,
  error: null,
  search: "",
  statusFilter: null,
  page: 0,
  totalPages: 0,
  totalElements: 0,

  current: null,
  currentStatus: "idle",
  currentError: null,
  teachers: emptyMembers,
  students: emptyMembers,
};

type ThunkConfig = { rejectValue: ApiErrorPayload };

// ---- Subject CRUD ----

export const searchSubjects = createAsyncThunk<SubjectPage, SearchSubjectsParams, ThunkConfig>(
  "subjects/search",
  async (params, { rejectWithValue }) => {
    try {
      return await searchRequest({ size: PAGE_SIZE, ...params });
    } catch (err) {
      return rejectWithValue(toErrorPayload(err, "Could not load subjects"));
    }
  },
);

export const fetchSubject = createAsyncThunk<SubjectResponse, string, ThunkConfig>(
  "subjects/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      return await getByIdRequest(id);
    } catch (err) {
      return rejectWithValue(toErrorPayload(err, "Subject not found"));
    }
  },
);

export const addSubject = createAsyncThunk<SubjectResponse, CreateSubjectRequest, ThunkConfig>(
  "subjects/create",
  async (body, { rejectWithValue }) => {
    try {
      return await createRequest(body);
    } catch (err) {
      return rejectWithValue(toErrorPayload(err, "Could not create subject"));
    }
  },
);

export const updateSubject = createAsyncThunk<
  SubjectResponse,
  { id: string; body: UpdateSubjectRequest },
  ThunkConfig
>("subjects/update", async ({ id, body }, { rejectWithValue }) => {
  try {
    return await updateRequest(id, body);
  } catch (err) {
    return rejectWithValue(toErrorPayload(err, "Could not update subject"));
  }
});

export const deleteSubject = createAsyncThunk<string, string, ThunkConfig>(
  "subjects/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteRequest(id);
      return id;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err, "Could not delete subject"));
    }
  },
);

// ---- Teachers / students of a subject ----

async function resolveTeacher(id: string): Promise<SubjectMember> {
  const teacher = await getTeacherRequest(id);
  return {
    personId: id,
    name: `${teacher.firstName} ${teacher.lastName}`,
    email: teacher.email,
    number: teacher.employeeNumber,
    resolved: true,
  };
}

async function resolveStudent(id: string): Promise<SubjectMember> {
  const student = await getStudentRequest(id);
  return {
    personId: id,
    name: `${student.firstName} ${student.lastName}`,
    email: student.email,
    number: student.studentNumber,
    resolved: true,
  };
}

export const fetchSubjectMembers = createAsyncThunk<
  SubjectMember[],
  { subjectId: string; kind: MemberKind },
  ThunkConfig
>("subjects/fetchMembers", async ({ subjectId, kind }, { rejectWithValue }) => {
  try {
    const ids =
      kind === "teacher"
        ? (await listTeachersRequest(subjectId)).map((a) => a.teacherId)
        : (await listStudentsRequest(subjectId)).map((e) => e.studentId);

    // The assignment endpoints only return ids; look each person up for display. One failed
    // lookup (e.g. the record was deleted after assignment) shouldn't hide the whole list.
    const resolve = kind === "teacher" ? resolveTeacher : resolveStudent;
    const results = await Promise.allSettled(ids.map(resolve));

    return results
      .map((result, i): SubjectMember =>
        result.status === "fulfilled"
          ? result.value
          : {
              personId: ids[i],
              name: kind === "teacher" ? "Unknown teacher" : "Unknown student",
              email: null,
              number: null,
              resolved: false,
            },
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    return rejectWithValue(
      toErrorPayload(err, `Could not load ${kind === "teacher" ? "teachers" : "students"}`),
    );
  }
});

export const addSubjectMember = createAsyncThunk<
  { kind: MemberKind; member: SubjectMember },
  { subjectId: string; kind: MemberKind; member: SubjectMember },
  ThunkConfig
>("subjects/addMember", async ({ subjectId, kind, member }, { rejectWithValue }) => {
  try {
    if (kind === "teacher") {
      await assignTeacherRequest(subjectId, member.personId);
    } else {
      await enrollStudentRequest(subjectId, member.personId);
    }
    return { kind, member };
  } catch (err) {
    return rejectWithValue(toErrorPayload(err, "Could not add to subject"));
  }
});

export const removeSubjectMember = createAsyncThunk<
  { kind: MemberKind; personId: string },
  { subjectId: string; kind: MemberKind; personId: string },
  ThunkConfig
>("subjects/removeMember", async ({ subjectId, kind, personId }, { rejectWithValue }) => {
  try {
    if (kind === "teacher") {
      await unassignTeacherRequest(subjectId, personId);
    } else {
      await unenrollStudentRequest(subjectId, personId);
    }
    return { kind, personId };
  } catch (err) {
    return rejectWithValue(toErrorPayload(err, "Could not remove from subject"));
  }
});

function membersKey(kind: MemberKind): "teachers" | "students" {
  return kind === "teacher" ? "teachers" : "students";
}

const subjectSlice = createSlice({
  name: "subjects",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(searchSubjects.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.search = action.meta.arg.search ?? "";
        state.statusFilter = action.meta.arg.status ?? null;
      })
      .addCase(searchSubjects.fulfilled, (state, action) => {
        state.status = "idle";
        state.initialized = true;
        state.subjects = action.payload.content;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(searchSubjects.rejected, (state, action) => {
        state.status = "failed";
        state.initialized = true;
        state.error = action.payload?.message ?? "Retrieving data failed";
      })

      .addCase(fetchSubject.pending, (state, action) => {
        state.currentStatus = "loading";
        state.currentError = null;
        if (state.current?.id !== action.meta.arg) {
          state.current = null;
          state.teachers = emptyMembers;
          state.students = emptyMembers;
        }
      })
      .addCase(fetchSubject.fulfilled, (state, action) => {
        state.currentStatus = "idle";
        state.current = action.payload;
      })
      .addCase(fetchSubject.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.currentError = action.payload ?? { message: "Subject not found" };
      })

      .addCase(updateSubject.fulfilled, (state, action) => {
        const index = state.subjects.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.subjects[index] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.subjects = state.subjects.filter((s) => s.id !== action.payload);
        state.totalElements = Math.max(0, state.totalElements - 1);
        if (state.current?.id === action.payload) state.current = null;
      })

      .addCase(fetchSubjectMembers.pending, (state, action) => {
        const members = state[membersKey(action.meta.arg.kind)];
        members.status = "loading";
        members.error = null;
        members.requestId = action.meta.requestId;
      })
      .addCase(fetchSubjectMembers.fulfilled, (state, action) => {
        const members = state[membersKey(action.meta.arg.kind)];
        if (members.requestId !== action.meta.requestId) return;
        members.status = "idle";
        members.items = action.payload;
      })
      .addCase(fetchSubjectMembers.rejected, (state, action) => {
        const members = state[membersKey(action.meta.arg.kind)];
        if (members.requestId !== action.meta.requestId) return;
        members.status = "failed";
        members.error = action.payload?.message ?? "Could not load members";
      })

      .addCase(addSubjectMember.fulfilled, (state, action) => {
        const members = state[membersKey(action.payload.kind)];
        if (!members.items.some((m) => m.personId === action.payload.member.personId)) {
          members.items.push(action.payload.member);
          members.items.sort((a, b) => a.name.localeCompare(b.name));
        }
      })
      .addCase(removeSubjectMember.fulfilled, (state, action) => {
        const members = state[membersKey(action.payload.kind)];
        members.items = members.items.filter((m) => m.personId !== action.payload.personId);
      });
  },
});

export const PAGE_SIZE_DEFAULT = PAGE_SIZE;
export const { clearError } = subjectSlice.actions;

export default subjectSlice.reducer;
