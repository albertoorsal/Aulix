# 📘 Development Rules

## Aulix – Project Guidelines for AI & Human Collaboration

This document defines the development rules, coding standards and best practices to follow while building the Aulix application. These rules keep the code consistent, maintainable, secure and of high quality.
**Both AI assistants and human contributors must follow these guidelines.**

---

## 1️⃣ General Principles

These rules apply to the entire project.

- ✅ Follow the project documentation ([PRD](./PRD.md), [ARCHITECTURE](./ARCHITECTURE.md), [DESIGN](./DESIGN.md)) before making changes.
- ✅ Check [TASKS.md](./TASKS.md) and [MEMORY.md](./MEMORY.md) to know the current phase and status.
- ✅ Keep the code clean, readable and well-structured.
- ✅ Prioritize simplicity and maintainability.
- ✅ Do not duplicate logic. Reuse `common-core`, `security-starter`, existing components, slices and API helpers.
- ✅ Make small, focused changes instead of large, risky edits.
- ✅ Do not modify unrelated files.
- ✅ Write self-explanatory code with meaningful names. Comment the *why*, not the *what*.
- ✅ All code, comments, commits and documentation are written in **English**.

## 2️⃣ Technology & Coding Standards

| Area | Rule |
|---|---|
| **Backend language** | Java 21. Use records for DTOs, `var` only when the type is obvious. |
| **Backend framework** | Spring Boot 4 / Spring Cloud. Constructor injection only (Lombok `@RequiredArgsConstructor`). |
| **Frontend language** | TypeScript. Avoid `any` unless absolutely necessary. |
| **Frontend framework** | React 19 with function components and hooks. |
| **State** | Redux Toolkit slices with `createAsyncThunk`; typed `useAppDispatch` / `useAppSelector`. |
| **Forms** | Formik with validation in `src/schemas/`. |
| **Styling** | Tailwind CSS + shadcn/ui tokens defined in `index.css`. Follow [DESIGN.md](./DESIGN.md). No hard-coded colors. |
| **Linting** | Fix every ESLint warning (`npm run lint`). `src/components/ui` is generated and excluded. |
| **Dependencies** | Use stable, well-maintained packages. Versions are managed in the root `pom.xml` / `package.json`. Avoid new dependencies without a reason. |
| **File naming** | Java: `PascalCase` classes (`StudentServiceImpl`). React components: `PascalCase.tsx` (`SubjectFormDialog.tsx`). Slices: `<domain>Slice.ts`. APIs: `src/apis/<domain>.ts`. Hooks: `use-<name>.ts`. |

## 3️⃣ Project Structure

Follow the structure defined in [ARCHITECTURE.md](./ARCHITECTURE.md#3-folder-structure).

- ✅ New backend services copy the layout of `student-service` / `subject-service` (`client`, `config`, `controller`, `domain`, `dto`, `exception`, `mapper`, `repository`, `service/impl`).
- ✅ Shared backend code (responses, errors, pagination, base entity) goes in `libraries/common-core`.
- ✅ Shared security code (roles, JWT converter) goes in `libraries/security-starter`.
- ✅ Service configuration goes in `infrastructure/config-repo/<service>.yml`, not in the service's own `application.yml`.
- ✅ Frontend: pages in `/pages`, reusable components in `/components`, shadcn primitives in `/components/ui`, slices in `/features/<domain>`, HTTP in `/apis`, types and validation in `/schemas`.
- ✅ Do not create new folders without a clear reason. Follow the existing pattern.

## 4️⃣ UI/UX Guidelines

- ✅ Use shadcn/ui components before building custom ones.
- ✅ Every async action shows a loading state and a Sonner toast for success or error.
- ✅ Destructive actions (delete, remove, disable) always require a confirmation dialog.
- ✅ Every list page has search, pagination and an empty state.
- ✅ Hide or disable actions the current role cannot perform (`useHasAnyRole`).
- ✅ Show backend error messages clearly (duplicate, not found, service unavailable).

## 5️⃣ Database & Backend Rules

- ✅ Schema changes only through **Flyway** migrations (`V<n>__<description>.sql`). Never edit an applied migration.
- ✅ JPA runs with `ddl-auto: validate`. Hibernate never creates tables.
- ✅ Each service has its own Flyway history table: `flyway_schema_history_<service>`.
- ✅ Entities extend `BaseEntity` (UUID id, `version`, `created_at`, `updated_at`).
- ✅ A service never reads another service's tables. Cross-service data is fetched through a REST client and referenced by UUID (no foreign key).
- ✅ Controllers return `ApiResponse<T>` / `PageResponse<T>` from `common-core`.
- ✅ Throw `common-core` exceptions (`ResourceNotFoundException`, `ResourceAlreadyExistsException`, `BusinessRuleViolationException`). `GlobalExceptionHandler` turns them into `ApiError`.
- ✅ Search endpoints use a `SearchCriteria` DTO + JPA `Specifications` + pagination.
- ✅ Map entities to DTOs with MapStruct. Never expose entities from controllers.

## 6️⃣ Authentication & Authorization

- ✅ Every endpoint has an explicit `@PreAuthorize` using the `Roles` constants. Never use string literals.
- ✅ The backend is the source of truth for permissions. Frontend guards (`ProtectedRoute`, `RoleRoute`) only improve UX.
- ✅ Tokens stay in HttpOnly cookies. Never store tokens in `localStorage` or read them from JS.
- ✅ Service-to-service calls forward the caller's token (`AuthHeaderForwardingInterceptor`).
- ✅ PARENT users may only read data about students linked to them.

## 7️⃣ API & External Services

- ✅ All client traffic goes through the gateway (`/api/<domain>/**`).
- ✅ Every new route gets a circuit breaker, a time limiter and a `/fallback/<service>` entry in `FallbackController`.
- ✅ REST paths are plural nouns (`/api/students`, `/api/subjects/{id}/teachers/{teacherId}`).
- ✅ Every service exposes Swagger UI at `/swagger-ui.html`.
- ✅ Frontend API calls use `credentials: "include"` and the shared error helper (`toApiRequestError`).

## 8️⃣ Security Guidelines

- ✅ Never commit secrets. Use environment variables for DB credentials, admin seed and cookie flags.
- ✅ `COOKIE_SECURE=true` and a strict `SameSite` policy in any non-local environment.
- ✅ Validate all input with Bean Validation (`@Valid`, `@NotBlank`, `@Email`...).
- ✅ Do not log passwords, tokens or personal data.
- ✅ CORS is configured only in the gateway.

## 9️⃣ Testing Requirements

- ✅ Every service keeps its `@SpringBootTest` context test passing.
- ✅ New service logic gets unit tests (JUnit 5 + Mockito).
- ✅ Controllers and RBAC rules get integration tests (Testcontainers + PostgreSQL).
- ✅ Frontend guards, forms and slices get Vitest + React Testing Library tests *(from Phase 12)*.
- ✅ Critical flows get Playwright E2E tests *(from Phase 12)*.
- ✅ CI must be green before merging.

## 🔟 Git & Version Control

- ✅ `main` is always buildable. Work on feature branches (`feature/<name>`, `fix/<name>`).
- ✅ Open a pull request. The CI workflow (backend build + tests, frontend lint + build) must pass.
- ✅ Commit messages are short, imperative and in English (`Add parent-student link endpoint`).
- ✅ One logical change per commit.
- ✅ Never commit `target/`, `dist/`, `node_modules/` or `.env` files.

## 1️⃣1️⃣ Documentation

- ✅ Update [TASKS.md](./TASKS.md) when a task changes status.
- ✅ Update [MEMORY.md](./MEMORY.md) at the end of each work session.
- ✅ Record significant decisions as an ADR in `docs/adr/NNNN-title.md`.
- ✅ Update [ARCHITECTURE.md](./ARCHITECTURE.md) when adding a service, route or table.

## 1️⃣2️⃣ AI Collaboration Guidelines

- ✅ Read `MEMORY.md` and `TASKS.md` first to understand the current state.
- ✅ Follow the existing patterns of the closest similar module (e.g., `subject-service` for a new service, `Subject.tsx` for a new list page).
- ✅ Explain the plan before large changes. Keep changes scoped to the current task.
- ✅ Do not invent endpoints, fields or files. Verify them in the code.
- ✅ Run the build, lint and tests after changes and report the results honestly.
- ✅ Update the documentation as part of the task.

## 1️⃣3️⃣ What NOT to Do

- ❌ Don't access another service's tables directly.
- ❌ Don't skip `@PreAuthorize` on a new endpoint.
- ❌ Don't add a gateway route without a circuit breaker and fallback.
- ❌ Don't edit an applied Flyway migration.
- ❌ Don't hard-code URLs, secrets or colors.
- ❌ Don't store tokens in `localStorage`.
- ❌ Don't hand-edit `src/components/ui` (regenerate with the shadcn CLI instead).
- ❌ Don't commit code that fails lint, build or tests.

## 1️⃣4️⃣ Definition of Done

A task is done when:

- [ ] The feature works end-to-end through the gateway.
- [ ] RBAC is enforced in the backend and reflected in the UI.
- [ ] Errors are handled and shown clearly to the user.
- [ ] Flyway migrations, Swagger docs and config-repo entries are in place (backend).
- [ ] Tests are added or updated, and CI is green.
- [ ] Lint passes with no warnings.
- [ ] `TASKS.md` and `MEMORY.md` are updated.

## 1️⃣5️⃣ Revision History

| Version | Date | Changes |
|---|---|---|
| 1.0 | Sep 27, 2026 | Initial rules document |
