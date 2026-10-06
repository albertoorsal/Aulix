# ✅ Project Tasks

## Aulix – Task Breakdown & Development Plan

This document lists every task for building the Aulix application, from the first commit to the MVP.
Tasks are grouped into phases with clear deliverables, priorities and status tracking.

> **Renumbering note:** The earlier plan used Phase 0–5. Old *Phase 0 (Cleanup & decisions)* is now **Phase 7**, old *Phase 1 (Subjects frontend)* is now **Phase 8**, and the old Phases 2, 3, 4 and 5 are now **Phases 9, 10, 11 and 12**. ADR 0001 still uses the old numbers.

---

| 📋 Total Tasks | ✅ Completed | 🔄 In Progress | ⬜ Not Started |
|:---:|:---:|:---:|:---:|
| **97** | **69** (71%) | **0** (0%) | **28** (29%) |

**Legend:** Priority 🔴 High · 🟠 Medium · 🟢 Low — Status ✅ Completed · 🔄 In Progress · ⬜ Not Started

---

## ✅ Phase 1: Platform Foundation — `8/8 completed`

Set up the monorepo, shared libraries and the Spring Cloud infrastructure services.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 1.1 | Create Maven multi-module parent POM | 🔴 High | ✅ Completed | Java 21, Spring Boot 4.0.7, Spring Cloud 2025.1.0 |
| 1.2 | Build `common-core` library | 🔴 High | ✅ Completed | `BaseEntity`, `ApiResponse`, `ApiError`, `PageResponse`, exceptions, `GlobalExceptionHandler` |
| 1.3 | Build `security-starter` library | 🔴 High | ✅ Completed | Resource server auto-config, `RbacJwtAuthenticationConverter`, `Roles` |
| 1.4 | Create `service-registry` (Eureka) | 🔴 High | ✅ Completed | Port 8761 |
| 1.5 | Create `config-server` (native) | 🔴 High | ✅ Completed | Port 8888, reads `infrastructure/config-repo` |
| 1.6 | Create `api-gateway` | 🔴 High | ✅ Completed | Port 8080, `lb://` routes |
| 1.7 | Create `admin-server` (Spring Boot Admin) | 🟢 Low | ✅ Completed | Port 9090 |
| 1.8 | Shared PostgreSQL database with per-service Flyway history | 🔴 High | ✅ Completed | `flyway_schema_history_<service>`, `baseline-on-migrate` |

## ✅ Phase 2: Authentication & Authorization — `11/11 completed`

Implement login, tokens, sessions and role-based access.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 2.1 | Create users, roles and permissions schema | 🔴 High | ✅ Completed | Flyway V1–V2 in auth-service |
| 2.2 | Seed roles | 🔴 High | ✅ Completed | ADMIN, STAFF, TEACHER, PARENT (V3), STUDENT (V4) |
| 2.3 | RSA-signed JWT + JWKS endpoint | 🔴 High | ✅ Completed | `RsaKeyProvider`, `JwtTokenService`, `/oauth2/jwks` |
| 2.4 | Register, login and refresh endpoints | 🔴 High | ✅ Completed | Access token 30 min, refresh 14 days |
| 2.5 | HttpOnly cookie service | 🔴 High | ✅ Completed | `CookieService`, configurable `secure` / `same-site` / `domain` |
| 2.6 | Verify session endpoint | 🔴 High | ✅ Completed | `GET /api/auth/verify` |
| 2.7 | Logout endpoint | 🔴 High | ✅ Completed | Clears auth cookies |
| 2.8 | Gateway security + cookie-to-header filter | 🔴 High | ✅ Completed | `GatewaySecurityConfig`, `CookieToAuthorizationHeaderFilter`, CORS |
| 2.9 | User management API | 🔴 High | ✅ Completed | `/api/users`: search, `me`, enable/disable, assign/revoke role, batch, update, delete |
| 2.10 | Admin user seeder | 🟠 Medium | ✅ Completed | `AdminUserSeeder` from `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` |
| 2.11 | RBAC with `@PreAuthorize` on every endpoint | 🔴 High | ✅ Completed | Shared `Roles` constants |

## ✅ Phase 3: Frontend Foundation — `8/8 completed`

Create the React application, state management, routing and the base layout.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 3.1 | Scaffold Vite + React + TypeScript app | 🔴 High | ✅ Completed | `applications/frontend-aulix` |
| 3.2 | Redux store + `authSlice` | 🔴 High | ✅ Completed | `checkAuth` on app start, typed hooks |
| 3.3 | Route guards | 🔴 High | ✅ Completed | `ProtectedRoute`, `PublicRoute`, `RoleRoute` |
| 3.4 | Login page | 🔴 High | ✅ Completed | Formik validation |
| 3.5 | Logout | 🔴 High | ✅ Completed | Account menu in header |
| 3.6 | Tailwind 4 + shadcn/ui + design tokens | 🟠 Medium | ✅ Completed | Light/dark tokens in `index.css` |
| 3.7 | Dashboard layout + collapsible sidebar | 🟠 Medium | ✅ Completed | `DashboardLayout`, `AppSidebar`, breadcrumbs, dropdown animation |
| 3.8 | API error helper + toasts | 🟠 Medium | ✅ Completed | `lib/api-error.ts`, Sonner |

## ✅ Phase 4: Student Management — `8/8 completed`

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 4.1 | Create `student-service` with Flyway schema | 🔴 High | ✅ Completed | Port 8081, `/api/students` |
| 4.2 | Create student + provision user account | 🔴 High | ✅ Completed | `UserClient` → `/api/auth/register`, role STUDENT |
| 4.3 | Search students with user data | 🔴 High | ✅ Completed | Specifications + pagination + `/api/users/batch` |
| 4.4 | Update and delete student (with user sync) | 🔴 High | ✅ Completed | |
| 4.5 | Controller advice for API error messages | 🟠 Medium | ✅ Completed | Clear `ApiError` bodies |
| 4.6 | Student list page + `studentSlice` | 🔴 High | ✅ Completed | Search + pagination |
| 4.7 | Add student form | 🔴 High | ✅ Completed | Formik + DatePicker + toast |
| 4.8 | Edit and delete student dialogs | 🔴 High | ✅ Completed | Confirmation on delete |

## ✅ Phase 5: Staff Management — `5/5 completed`

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 5.1 | Create `staff-service` with Flyway schema | 🔴 High | ✅ Completed | Port 8082, `/api/staff` |
| 5.2 | Staff CRUD + user provisioning | 🔴 High | ✅ Completed | ADMIN writes, ADMIN/STAFF read |
| 5.3 | Staff list page + `staffSlice` | 🔴 High | ✅ Completed | |
| 5.4 | Add, edit and delete staff UI | 🔴 High | ✅ Completed | |
| 5.5 | Sidebar "Users" dropdown | 🟢 Low | ✅ Completed | Collapsible with animation |

## ✅ Phase 6: Teacher Management — `4/4 completed`

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 6.1 | Create `teacher-service` with Flyway schema | 🔴 High | ✅ Completed | Port 8083, `/api/teachers` |
| 6.2 | Teacher CRUD + user provisioning | 🔴 High | ✅ Completed | ADMIN writes |
| 6.3 | Teacher list page + `teacherSlice` | 🔴 High | ✅ Completed | |
| 6.4 | Add, edit and delete teacher UI | 🔴 High | ✅ Completed | |

## ✅ Phase 7: Platform Cleanup & Decisions *(old Phase 0)* — `7/7 completed`

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 7.1 | Decide on `notification-service` | 🟠 Medium | ✅ Completed | Build it in Phase 11; unused breaker config removed |
| 7.2 | Circuit breaker on every gateway route | 🔴 High | ✅ Completed | Includes `/api/subjects/**` |
| 7.3 | `FallbackController` entries for every service | 🔴 High | ✅ Completed | student, staff, teacher, subject, auth, user |
| 7.4 | Per-route time limits | 🟠 Medium | ✅ Completed | 10 s domain services, 5 s auth |
| 7.5 | Decide the Parent model | 🔴 High | ✅ Completed | Many-to-many via `parent_student` (ADR 0001) |
| 7.6 | CI pipeline (GitHub Actions) | 🔴 High | ✅ Completed | Backend build + tests, frontend lint + build |
| 7.7 | Docker Compose for PostgreSQL | 🟠 Medium | ✅ Completed | Host port 5433 |

## ✅ Phase 8: Subject Management *(old Phase 1)* — `10/10 completed`

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 8.1 | Create `subject-service` with Flyway schema | 🔴 High | ✅ Completed | Port 8084, `subject`, `subject_teacher`, `subject_student` |
| 8.2 | Subject CRUD + search | 🔴 High | ✅ Completed | Code/name search, status filter |
| 8.3 | Teacher assignment + student enrollment | 🔴 High | ✅ Completed | Validated via `TeacherClient` / `StudentClient`; duplicates rejected |
| 8.4 | `subjectsApi` client | 🔴 High | ✅ Completed | CRUD, search, assign, enroll |
| 8.5 | `subjectSlice` | 🔴 High | ✅ Completed | Loading, error, pagination |
| 8.6 | Subjects list page | 🔴 High | ✅ Completed | Search, active/inactive filter, pagination |
| 8.7 | Add/Edit subject form + delete dialog | 🔴 High | ✅ Completed | `SubjectFormDialog`, `DeleteSubjectDialog` |
| 8.8 | Subject detail page (Teachers / Students tabs) | 🔴 High | ✅ Completed | `SubjectMembersPanel`, `PersonPickerDialog` |
| 8.9 | Clear backend error messages | 🟠 Medium | ✅ Completed | `subjectErrors.ts` (duplicate, not found) |
| 8.10 | Sidebar entry + role guard | 🟠 Medium | ✅ Completed | ADMIN/STAFF edit, TEACHER view-only |

---

## ✅ Phase 9: Admin Module *(old Phase 2)* — `8/8 completed`

Mostly frontend work on top of the existing `/api/users` endpoints, plus an audit log in auth-service.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 9.1 | Replace the `Admin.tsx` placeholder with an admin layout | 🔴 High | ✅ Completed | `Admin.tsx` is the layout for `/admin/*` (Users / Audit log nav + `Outlet`) |
| 9.2 | Fix sidebar "Admin" link | 🔴 High | ✅ Completed | `/admin`, shown to ADMIN only, active on nested pages |
| 9.3 | Users page: paginated search, enable/disable toggle, delete | 🔴 High | ✅ Completed | `AdminUsers.tsx`, `usersApi`, `userSlice`; filters by role and status; search also matches email |
| 9.4 | Role management dialog (assign / revoke) | 🔴 High | ✅ Completed | `UserRolesDialog`; you can't remove your own ADMIN role |
| 9.5 | User detail / edit page | 🟠 Medium | ✅ Completed | `/admin/users/:id` + `UserFormDialog`; duplicate email → 409 |
| 9.6 | Backend audit log | 🟠 Medium | ✅ Completed | V5 `audit_log`; logs role changes, enable/disable, update, delete; no-ops aren't logged |
| 9.7 | Audit view in the admin module | 🟠 Medium | ✅ Completed | `/admin/audit` (email search + action filter) and an Activity card per user |
| 9.8 | Decide the fate of the `permissions` table | 🟢 Low | ✅ Completed | Kept as reserved, roles only ([ADR 0002](./adr/0002-permissions-table.md)) |

## ⬜ Phase 10: Parent Module *(old Phase 3)* — `0/10 completed`

The largest new piece of work. The design is fixed in ADR 0001 (many-to-many).

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 10.1 | Scaffold `parent-service` | 🔴 High | ⬜ Not Started | Copy the student/staff structure; Flyway, Swagger, Eureka, config-repo |
| 10.2 | Gateway route `/api/parents/**` + breaker + fallback | 🔴 High | ⬜ Not Started | Add `/fallback/parent` |
| 10.3 | Parent CRUD + provision login account (role PARENT) | 🔴 High | ⬜ Not Started | Reuse the `UserClient` pattern |
| 10.4 | Link / unlink parent ↔ student | 🔴 High | ⬜ Not Started | `parent_student` (relationship, primary_contact); validate via `StudentClient` |
| 10.5 | Restrict PARENT to their own children | 🔴 High | ⬜ Not Started | Enforced in parent-service |
| 10.6 | Role rules: ADMIN/STAFF create, edit, delete | 🔴 High | ⬜ Not Started | `@PreAuthorize` |
| 10.7 | `parentsApi` + `parentSlice` | 🔴 High | ⬜ Not Started | |
| 10.8 | Parents management page (list, add, edit, delete, link) | 🔴 High | ⬜ Not Started | ADMIN/STAFF |
| 10.9 | "My children" portal for PARENT | 🔴 High | ⬜ Not Started | Child info + enrolled subjects |
| 10.10 | Fix sidebar "Parent" link + PARENT route guard | 🟠 Medium | ⬜ Not Started | Currently `href: "#"` |

## ⬜ Phase 11: Notifications *(old Phase 4, optional)* — `0/7 completed`

Kept by the Phase 7 decision.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 11.1 | Create `notification-service` + `notification` table | 🟠 Medium | ⬜ Not Started | |
| 11.2 | Endpoints: send, list, mark as read | 🟠 Medium | ⬜ Not Started | |
| 11.3 | Gateway route + breaker + `/fallback/notification` | 🟠 Medium | ⬜ Not Started | |
| 11.4 | Publish domain events to Kafka | 🟠 Medium | ⬜ Not Started | Enrollment, parent linked, user created. No producers exist in code yet |
| 11.5 | Consume events and create notifications | 🟠 Medium | ⬜ Not Started | Asynchronous, so an outage never blocks the flow |
| 11.6 | Notification bell in the dashboard header | 🟠 Medium | ⬜ Not Started | Unread count + dropdown |
| 11.7 | Email delivery | 🟢 Low | ⬜ Not Started | Extension |

## ⬜ Phase 12: Quality & Hardening *(old Phase 5)* — `0/11 completed`

Ongoing; about one week for the base.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 12.1 | Backend unit tests for service classes | 🔴 High | ⬜ Not Started | JUnit 5 + Mockito |
| 12.2 | Controller integration tests with Testcontainers | 🔴 High | ⬜ Not Started | Priority: auth, RBAC, subject assignment/enrollment |
| 12.3 | Frontend unit tests | 🟠 Medium | ⬜ Not Started | Vitest + RTL: guards, forms, slices |
| 12.4 | Playwright E2E flows | 🟠 Medium | ⬜ Not Started | Login → create student → enroll in subject → logout |
| 12.5 | Review CORS and cookie flags | 🔴 High | ⬜ Not Started | `Secure`, `SameSite`, allowed origins per environment |
| 12.6 | Rate limiting on login at the gateway | 🔴 High | ⬜ Not Started | |
| 12.7 | Refresh-token rotation + revocation on logout | 🔴 High | ⬜ Not Started | |
| 12.8 | Correlation ID across services | 🟠 Medium | ⬜ Not Started | Through the gateway; Zipkin tracing already configured |
| 12.9 | Remove default DB credentials from `config-repo` | 🔴 High | ⬜ Not Started | Defaults for `DB_USERNAME` / `DB_PASSWORD` are committed |
| 12.10 | Move frontend API base URL to env (`VITE_API_URL`) | 🟠 Medium | ⬜ Not Started | `http://localhost:8080` is hard-coded in `src/apis/*` |
| 12.11 | README: local startup order + Docker Compose | 🟠 Medium | ⬜ Not Started | Eureka → config-server → services |

---

## 📊 Task Summary

| Phase | Name | Tasks | Completed | Status |
|---|---|:---:|:---:|---|
| 1 | Platform Foundation | 8 | 8 | ✅ Completed |
| 2 | Authentication & Authorization | 11 | 11 | ✅ Completed |
| 3 | Frontend Foundation | 8 | 8 | ✅ Completed |
| 4 | Student Management | 8 | 8 | ✅ Completed |
| 5 | Staff Management | 5 | 5 | ✅ Completed |
| 6 | Teacher Management | 4 | 4 | ✅ Completed |
| 7 | Platform Cleanup & Decisions | 7 | 7 | ✅ Completed |
| 8 | Subject Management | 10 | 10 | ✅ Completed |
| 9 | Admin Module | 8 | 8 | ✅ Completed |
| 10 | Parent Module | 10 | 0 | ⬜ Next up |
| 11 | Notifications (optional) | 7 | 0 | ⬜ Not Started |
| 12 | Quality & Hardening | 11 | 0 | ⬜ Not Started |
| | **Total** | **97** | **69** | **71%** |
