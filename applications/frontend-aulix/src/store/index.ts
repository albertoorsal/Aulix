import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import studentReducer from "../features/students/studentSlice";
import staffReducer from "../features/staffs/staffSlice";
import teacherReducer from "../features/teachers/teacherSlice";
import subjectReducer from "../features/subjects/subjectSlice";
import userReducer from "../features/users/userSlice";
import auditReducer from "../features/users/auditSlice";
import parentReducer from "../features/parents/parentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // HERE add more slices
    students: studentReducer,
    staffs: staffReducer,
    teachers: teacherReducer,
    subjects: subjectReducer,
    users: userReducer,
    audit: auditReducer,
    parents: parentReducer,
  },
});

// Infer types straight from the store so they never drift.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
