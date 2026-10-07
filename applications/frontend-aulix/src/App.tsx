import ProtectedRoute from "./routes/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { Navigate, Route, Routes } from "react-router";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { checkAuth, selectIsInitialized } from "./features/auth/authSlice";
import { useEffect } from "react";
import Login from "./pages/Login";
import RoleRoute from "./routes/RoleRoute";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetail from "./pages/AdminUserDetail";
import AdminAuditLog from "./pages/AdminAuditLog";
import PublicRoute from "./routes/PublicRouter";
import Student from "./pages/Student";
import Staff from "./pages/Staff";
import Teacher from "./pages/Teacher";
import Subject from "./pages/Subject";
import SubjectDetail from "./pages/SubjectDetail";
import Parent from "./pages/Parent";
import ParentDetail from "./pages/ParentDetail";
import MyChildren from "./pages/MyChildren";
import { SUBJECT_VIEW_ROLES } from "./schemas/subject";
import { PARENT_MANAGE_ROLES, PARENT_PORTAL_ROLES } from "./schemas/parent";
import { ADMIN_ROLES } from "./schemas/user";
import { Toaster } from "./components/ui/sonner";

function App() {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector(selectIsInitialized);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (!initialized) {
    return (
      <div>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <Routes>
        {/* Public */}

        {/* Login is public, but redirect away if already signed in */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Private: must be authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/students" element={<Student />} />

          <Route path="/staff" element={<Staff />} />

          <Route path="/teachers" element={<Teacher />} />

          {/* Subjects: ADMIN/STAFF edit, TEACHER is read-only (enforced in the page) */}
          <Route element={<RoleRoute allow={SUBJECT_VIEW_ROLES} />}>
            <Route path="/subjects" element={<Subject />} />
            <Route path="/subjects/:id" element={<SubjectDetail />} />
          </Route>

          {/* Parents: ADMIN/STAFF manage parents and their links */}
          <Route element={<RoleRoute allow={PARENT_MANAGE_ROLES} />}>
            <Route path="/parents" element={<Parent />} />
            <Route path="/parents/:id" element={<ParentDetail />} />
          </Route>

          {/* "My children" portal: PARENT sees only their own children (enforced in the backend) */}
          <Route element={<RoleRoute allow={PARENT_PORTAL_ROLES} />}>
            <Route path="/my-children" element={<MyChildren />} />
          </Route>

          {/* Private AND admin-only: guards nest */}
          <Route element={<RoleRoute allow={ADMIN_ROLES} />}>
            <Route path="/admin" element={<Admin />}>
              <Route index element={<Navigate to="users" replace />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:id" element={<AdminUserDetail />} />
              <Route path="audit" element={<AdminAuditLog />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
