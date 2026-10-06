# 🧠 Project Memory

## Aulix – Context, Progress & Important Notes

This document tracks the current state of the project: important context, ongoing work, decisions and things to remember. It keeps work continuous across development sessions and when working with AI assistants or new contributors.

---

| 📅 Last Updated | 👤 Current Phase | 📈 Overall Progress | 💓 Project Status |
|:---:|:---:|:---:|:---:|
| **Oct 6, 2026** | **Phase 10** — Parent Module | **71%** (69 / 97 tasks) | **In Development** — MVP v1.0 |

---

## 1. 🎯 Current Status

- ✅ Platform foundation completed (Eureka, Config Server, Gateway, Admin Server, shared libraries)
- ✅ Authentication & RBAC completed (JWT in HttpOnly cookies, roles, `/api/users`)
- ✅ Frontend foundation completed (React, Redux, route guards, shadcn/ui, dashboard layout)
- ✅ Student, Staff and Teacher management completed (backend + frontend)
- ✅ Platform cleanup & decisions completed (circuit breakers, fallbacks, CI, Docker Compose, ADR 0001)
- ✅ Subject management completed (backend + frontend)
- ✅ Admin module completed (users, roles, enable/disable, audit log, ADR 0002) — on branch `feature/admin-module`
- ⭕ Next: Parent Module (Phase 10)

## 2. ✅ Completed Tasks

Dates come from the git history. See [TASKS.md](./TASKS.md) for every task.

| Phase | Deliverable | Completed On | Notes |
|---|---|---|---|
| 1 | Service registry, common-core, security-starter | Jul 25, 2026 | |
| 1 | API gateway, config server | Jul 25, 2026 | |
| 1 | Admin server | Jul 26, 2026 | |
| 2 | Auth service v1: login, register, refresh, user operations | Jul 26, 2026 | |
| 3 | Frontend getting started | Jul 28, 2026 | Vite + React + TS |
| 2 | Cookie service, verify user, login flow | Jul 28, 2026 | |
| 2/3 | Logout feature | Jul 30, 2026 | |
| 3 | shadcn/ui, login and dashboard styling | Jul 30, 2026 | |
| 4 | Create student + user provisioning, search with user relation, list | Aug 2, 2026 | |
| 4 | Add student form (Formik + toast) | Aug 4, 2026 | |
| 4 | API error messages (controller advice) | Aug 5, 2026 | |
| 4 | Student/user edit and delete | Aug 8, 2026 | |
| 5 | staff-service CRUD | Aug 9, 2026 | |
| 5 | Staff frontend (list, CRUD, sidebar dropdown) | Aug 16–17, 2026 | |
| 6 | teacher-service CRUD | Aug 19, 2026 | |
| 6 | Teacher frontend CRUD | Sep 6, 2026 | |
| 8 | subject-service (schema, CRUD, assignment, enrollment) | Sep 6, 2026 | |
| 7 | Circuit breakers + fallbacks, CI, Docker Compose, ADR 0001 | Sep 26, 2026 | |
| 8 | Subjects frontend (list, form, detail tabs, picker, guards) | Sep 27, 2026 | |
| 8 | Backend build fix | Sep 27, 2026 | |
| 9 | Admin module: users page, role dialog, user detail/edit, audit log (V5) + view, ADR 0002 | Oct 6, 2026 | Branch `feature/admin-module` |

## 3. 🔄 In Progress

| # | Task | Started On | Expected Completion | Notes |
|---|---|---|---|---|
| — | *Nothing in progress* | — | — | Phase 10 starts next |

## 4. 📌 Upcoming Tasks

| # | Task | Priority | Notes |
|---|---|---|---|
| 10.1 | Scaffold `parent-service` | 🔴 High | Copy student/subject-service layout, port 8085 |
| 10.2 | Gateway route `/api/parents/**` + breaker + fallback | 🔴 High | |
| 10.3–10.6 | Parent CRUD, links, PARENT scoping, RBAC | 🔴 High | ADR 0001 §3 |
| 10.7–10.10 | Parent frontend + "My children" portal + sidebar link | 🔴 High | |

After Phase 10: **Phase 11** Notifications (optional) → **Phase 12** Quality & Hardening.

## 5. 💡 Important Context

- **Monorepo:** Maven multi-module (`libraries/`, `applications/`). The frontend lives in `applications/frontend-aulix`.
- **Config:** Service config lives in `infrastructure/config-repo/<service>.yml`. Launch config-server from the repo root, or set `CONFIG_REPO_PATH`.
- **Database:** One shared `aulatech_db`. Each service uses its own Flyway history table. Docker Compose exposes Postgres on **5433**, so set `DB_URL` accordingly.
- **Ports:** registry 8761 · config 8888 · gateway 8080 · admin 9090 · auth 9000 · student 8081 · staff 8082 · teacher 8083 · subject 8084 · frontend 5173. Planned: parent 8085, notification 8086.
- **Auth:** The access token (30 min) and refresh token (14 days) are HttpOnly cookies. The gateway copies the cookie into the `Authorization` header for downstream services.
- **Provisioning:** Person services create the login account through `POST /api/auth/register` and enrich lists through `POST /api/users/batch`.
- **Roles:** ADMIN, STAFF, TEACHER, PARENT, STUDENT (`Roles` in security-starter). Authorization is role-only; the `permissions` table/claim is reserved (ADR 0002).
- **Audit log:** auth-service `audit_log` (V5). `UserServiceImpl` records role changes, enable/disable, update and delete via `AuditLogService`. Read at `GET /api/users/audit-logs` (ADMIN). An admin can't disable, delete, or revoke ADMIN from their own account.
- **Admin UI:** `/admin` → `Admin.tsx` layout with nested `/admin/users`, `/admin/users/:id`, `/admin/audit`. State in `features/users/userSlice.ts` + `auditSlice.ts` (separate `log` / `activity` lists).
- **Phase renumbering:** Old Phase 0 → 7, old 1 → 8, old 2–5 → 9–12. **ADR 0001 still uses the old numbers** ("Phase 4" = Phase 11, "Phase 5" = Phase 12).

## 6. 🐞 Known Issues

| Issue | Impact | Planned Fix |
|---|---|---|
| Sidebar "Parent" link points to `#` | Navigation dead end | 10.10 |
| `POST /api/auth/register` is public and accepts any role, including ADMIN | Anyone who can reach the gateway can create an admin account | Restrict to ADMIN/STAFF (or service calls) — Phase 12 |
| `PUT`/`DELETE /api/users/{id}` allow STAFF and TEACHER, not only ADMIN | Broader than the admin module needs (person services call them with the caller's token) | Review in Phase 12 |
| Default DB username/password are committed in `config-repo/*.yml` | Credential leak risk | 12.9 |
| `http://localhost:8080` is hard-coded in `src/apis/*` (6 places) | Can't deploy to another host | 12.10 |
| `COOKIE_SECURE` defaults to `false` | Insecure outside localhost | 12.5 |
| CORS allows only `http://localhost:5173` | Must be configured per environment | 12.5 |
| Kafka dependencies and topics are configured, but no producer/consumer code exists | ADR 0001 says services publish events; they don't yet | 11.4 |
| Only context-load tests exist (plus `FallbackControllerTest`) | Low test coverage | 12.1–12.4 |
| No dark-mode toggle (tokens exist) | Cosmetic | Future |

## 7. 🧭 Decisions & Notes

| Date | Decision | Reference |
|---|---|---|
| Sep 26, 2026 | Build `notification-service` later; it consumes Kafka events rather than being called synchronously | ADR 0001 §1 |
| Sep 26, 2026 | Every gateway route has a circuit breaker + `/fallback/{service}`; breakers trip only on connection errors/timeouts | ADR 0001 §2 |
| Sep 26, 2026 | Parent ↔ Student is many-to-many (`parent_student` with `relationship`, `primary_contact`), owned by parent-service | ADR 0001 §3 |
| Sep 26, 2026 | CI on GitHub Actions: backend build + tests with Postgres/Kafka services; frontend lint + build | ADR 0001 §4 |
| Sep 27, 2026 | Project documentation set created (PRD, ARCHITECTURE, RULES, DESIGN, TASKS, MEMORY) and phases renumbered 1–12 | This document |
| Oct 6, 2026 | Keep `permissions` as reserved; authorization stays role-based | ADR 0002 |
| Oct 6, 2026 | Audit endpoint lives at `/api/users/audit-logs` to reuse the existing gateway route/breaker | ARCHITECTURE §4.4 |

## 8. 🔗 Useful Links

| Resource | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:8080 |
| Eureka dashboard | http://localhost:8761 |
| Config Server (example) | http://localhost:8888/student-service/default |
| Spring Boot Admin | http://localhost:9090 |
| Swagger UI (per service) | http://localhost:{port}/swagger-ui.html |
| JWKS | http://localhost:9000/oauth2/jwks |
| Docs | [PRD](./PRD.md) · [Architecture](./ARCHITECTURE.md) · [Rules](./RULES.md) · [Design](./DESIGN.md) · [Tasks](./TASKS.md) · [ADRs](./adr) |

## 9. ➡️ Next Steps

1. Review and merge `feature/admin-module` once CI is green.
2. Scaffold `parent-service` (10.1) and its gateway route (10.2).
3. Consider fixing the public `/api/auth/register` role escalation before Phase 12.

## 10. 📝 Change Log

| Date | Change |
|---|---|
| Sep 27, 2026 | Created MEMORY.md. Phases 1–8 recorded as completed; Phase 9 is next. |
| Oct 6, 2026 | Phase 9 (Admin Module) completed; Phase 10 is next. |

---

> *"A well-documented project is a smooth project."*
