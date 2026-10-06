# 🏛️ System Architecture

## Aulix – School Management Platform

This document describes the overall system architecture, technology stack, folder structure, data flow and key design decisions for the Aulix application.

---

## 1. High-Level Architecture

Aulix follows a microservices architecture. A React SPA talks only to a Spring Cloud Gateway, which authenticates each request and routes it to the domain services. The services register in Eureka and pull their configuration from a Config Server.

```
┌──────────────┐  HTTPS   ┌──────────────────┐        ┌───────────────────────┐        ┌──────────────────┐
│     User     │ ───────► │  React Frontend  │ ─────► │      API Gateway      │ ─────► │  Domain Services │
│ (Web Browser)│ ◄─────── │  (Vite SPA :5173)│ ◄───── │ (Spring Cloud :8080)  │ ◄───── │ auth/student/... │
└──────────────┘          └──────────────────┘ cookies└───────────────────────┘  JWT   └────────┬─────────┘
                                                        │ circuit breakers  │                    │
                                                        │ + fallbacks       │                    ▼
                          ┌──────────────────┐   ┌──────┴───────┐   ┌───────────────┐   ┌──────────────┐
                          │ Service Registry │   │ Config Server│   │ Admin Server  │   │  PostgreSQL  │
                          │  (Eureka :8761)  │   │   (:8888)    │   │ (SBA :9090)   │   │ (aulatech_db)│
                          └──────────────────┘   └──────────────┘   └───────────────┘   └──────────────┘
```

### Services and Ports

| Service | Port | Responsibility | Status |
|---|---|---|---|
| `service-registry` | 8761 | Eureka service discovery | ✅ |
| `config-server` | 8888 | Centralized config (native, `infrastructure/config-repo`) | ✅ |
| `api-gateway` | 8080 | Routing, JWT validation, CORS, cookie-to-header, circuit breakers | ✅ |
| `admin-server` | 9090 | Spring Boot Admin monitoring UI | ✅ |
| `auth-service` | 9000 | Users, roles, login, tokens, JWKS, `/api/users`, audit log (`/api/users/audit-logs`) | ✅ |
| `student-service` | 8081 | Students (`/api/students`) | ✅ |
| `staff-service` | 8082 | Staff (`/api/staff`) | ✅ |
| `teacher-service` | 8083 | Teachers (`/api/teachers`) | ✅ |
| `subject-service` | 8084 | Subjects, teacher assignment, student enrollment (`/api/subjects`) | ✅ |
| `parent-service` | 8085 *(planned)* | Parents and parent–student links (`/api/parents`) | ⏳ |
| `notification-service` | 8086 *(planned)* | In-app notifications (`/api/notifications`) | ⏳ |
| `frontend-aulix` | 5173 | React SPA | ✅ |

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Language (backend) | Java 21 | Service implementation |
| Framework | Spring Boot 4.0.7 | Service runtime |
| Cloud | Spring Cloud 2025.1.0 (Gateway, Eureka, Config) | Routing, discovery, configuration |
| Resilience | Resilience4j | Circuit breakers, time limiters, retries |
| Security | Spring Security, OAuth2 Resource Server, JJWT | RSA-signed JWTs, JWKS, RBAC |
| Persistence | Spring Data JPA + Hibernate | ORM |
| Database | PostgreSQL 16 | Relational storage (shared DB, one Flyway history per service) |
| Migrations | Flyway | Versioned schema changes |
| Mapping | MapStruct + Lombok | DTO mapping, boilerplate reduction |
| API Docs | springdoc-openapi (Swagger UI) | Interactive API documentation |
| Messaging | Apache Kafka *(dependency present, not yet used in code)* | Domain events (planned for notifications) |
| Observability | Actuator, Prometheus, Zipkin, Spring Boot Admin | Health, metrics, tracing |
| Frontend | React 19 + Vite 8 | UI framework and build tool |
| Language (frontend) | TypeScript 6 | Type safety |
| State | Redux Toolkit + React Redux | Global state (feature slices) |
| Routing | React Router 7 | Pages and route guards |
| Forms | Formik | Forms and validation |
| Styling | Tailwind CSS 4 + shadcn/ui (Radix) | Design system and components |
| Icons / Toasts | lucide-react / Sonner | Icons and notifications |
| CI | GitHub Actions | Build, lint and test on each push/PR |
| Local infra | Docker Compose | PostgreSQL for development |
| Version Control | Git + GitHub | Source code management |

## 3. Folder Structure

The repository is a Maven multi-module monorepo. Every domain service follows the same layered, package-by-layer structure.

```text
Aulix/
├── pom.xml                         # Parent POM (Java 21, Spring Boot, Spring Cloud BOMs)
├── .github/workflows/ci.yml        # CI: backend build + tests, frontend lint + build
├── docs/                           # PRD, ARCHITECTURE, RULES, DESIGN, TASKS, MEMORY, adr/
├── infrastructure/
│   ├── config-repo/                # Config Server files: application.yml + <service>.yml
│   └── docker-compose.yml          # Local PostgreSQL (host port 5433)
├── libraries/
│   ├── common-core/                # BaseEntity, ApiResponse/ApiError, PageResponse, exceptions, GlobalExceptionHandler
│   └── security-starter/           # Resource-server auto-config, RbacJwtAuthenticationConverter, Roles
└── applications/
    ├── service-registry/           # Eureka
    ├── config-server/              # Spring Cloud Config (native)
    ├── api-gateway/                # Routes, GatewaySecurityConfig, FallbackController, cookie filter
    ├── admin-server/               # Spring Boot Admin
    ├── auth-service/
    ├── student-service/
    ├── staff-service/
    ├── teacher-service/
    ├── subject-service/
    └── frontend-aulix/             # React SPA
```

### Domain Service Layout

```text
<service>/src/main/java/com/aulix/<service>/
├── client/          # RestClient calls to other services (UserClient, StudentClient, TeacherClient)
├── config/          # OpenApiConfig, RestClientConfig, AuthHeaderForwardingInterceptor
├── controller/      # REST controllers with @PreAuthorize
├── domain/          # JPA entities (extend BaseEntity) and enums
├── dto/             # Request/response records and SearchCriteria
├── exception/       # Service-specific exceptions (Duplicate*, UserProvisioningException)
├── mapper/          # MapStruct mappers
├── repository/      # Spring Data repositories + JPA Specifications for search
└── service/         # Interfaces + impl/ implementations
src/main/resources/db/migration/   # Flyway V1__..., V2__...
```

### Frontend Layout

```text
frontend-aulix/src/
├── apis/            # fetch clients per domain (auth, students, staff, teachers, subjects, users)
├── components/
│   ├── layout/      # DashboardLayout, AppSidebar
│   ├── ui/          # shadcn/ui generated components (do not edit by hand)
│   └── *.tsx        # Feature dialogs/forms (AddStudent, SubjectFormDialog, PersonPickerDialog...)
├── features/        # Redux slices per domain (auth, students, staffs, teachers, subjects, users + audit)
├── hooks/           # use-has-role, use-mobile
├── lib/             # utils (cn), api-error helpers
├── pages/           # Route-level pages (Login, Dashboard, Student, Staff, Teacher, Subject, SubjectDetail,
│                    #   Admin layout + AdminUsers, AdminUserDetail, AdminAuditLog)
├── routes/          # ProtectedRoute, PublicRoute, RoleRoute
├── schemas/         # TypeScript types, Formik validation, role constants
└── store/           # configureStore + typed hooks
```

## 4. Data Flow

### 4.1 Authentication

1. The user submits credentials to `POST /api/auth/login` (through the gateway).
2. auth-service validates them, signs an access token (30 min) and a refresh token (14 days) with its RSA key, and returns them as **HttpOnly cookies**.
3. On each later request, the browser sends the `accessToken` cookie. The gateway validates the JWT against auth-service's JWKS (`/oauth2/jwks`), and `CookieToAuthorizationHeaderFilter` copies it into an `Authorization: Bearer` header.
4. Downstream services validate the bearer token (security-starter) and map the `roles` claim to authorities for `@PreAuthorize`.
5. On app start, the frontend calls `GET /api/auth/verify` (`checkAuth`) to restore the session. `POST /api/auth/refresh` renews tokens and `POST /api/auth/logout` clears the cookies.

### 4.2 Creating a Person (Student / Staff / Teacher)

1. The frontend sends `POST /api/students` (for example).
2. student-service calls auth-service `POST /api/auth/register` through `UserClient`, forwarding the caller's token (`AuthHeaderForwardingInterceptor`), to create the login account with the right role.
3. The student row is saved with the returned `user_id`. If provisioning fails, a `UserProvisioningException` is returned as a clear API error.
4. Search results combine domain data with user data (`POST /api/users/batch`).

### 4.3 Subject Assignment / Enrollment

1. `POST /api/subjects/{id}/teachers/{teacherId}` or `/students/{studentId}`.
2. subject-service checks that the person exists through `TeacherClient`/`StudentClient`, rejects duplicates (`DuplicateAssignmentException`), and saves the link row.

### 4.4 User Administration & Audit

1. An ADMIN changes a user through `/api/users/{id}` (update, delete, enable/disable, assign/revoke role).
2. In the same transaction, `UserServiceImpl` writes an `audit_log` row through `AuditLogService`: the action, the actor (token `sub` + email), the target's id and email, and details (role name or changed fields). Calls that change nothing are not logged.
3. An admin can't disable, delete or remove the ADMIN role from their own account (`BUSINESS_RULE_VIOLATION`), so at least one admin always remains.
4. `GET /api/users/audit-logs?userId=&search=&action=` (ADMIN only) returns the log, newest first. It sits under `/api/users` so it reuses the existing gateway route and breaker.

### 4.5 Failure Handling

Each gateway route passes through a Resilience4j `CircuitBreaker` filter. On connection errors or timeouts (10 s for domain services, 5 s for auth), the request is forwarded to `/fallback/{service}`, which returns a readable `503` body. 4xx and 5xx business errors pass through unchanged.

## 5. Database Schema

All services share one PostgreSQL database (`aulatech_db`). Each service owns its tables and has its own Flyway history table (`flyway_schema_history_<service>`), so version numbers never collide. Cross-service references are plain UUID columns without foreign keys. They are validated through REST clients.

| Service | Tables |
|---|---|
| auth-service | `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `audit_log` |
| student-service | `student` |
| staff-service | `staff` |
| teacher-service | `teacher` |
| subject-service | `subject`, `subject_teacher`, `subject_student` |
| parent-service *(planned)* | `parent`, `parent_student` |
| notification-service *(planned)* | `notification` |

```text
users 1───* user_roles *───1 roles *───* permissions (reserved, ADR 0002)
audit_log.target_user_id ─► users.id (logical, kept after the user is deleted)
student.user_id ─────► users.id        (logical, no FK)
staff.user_id   ─────► users.id
teacher.user_id ─────► users.id
subject 1───* subject_teacher ───► teacher.id (logical)
subject 1───* subject_student ───► student.id (logical)
parent  1───* parent_student  ───► student.id (logical, planned — many-to-many)
```

## 6. Key Architectural Decisions

Detailed records live in [`docs/adr/`](./adr).

| # | Decision | Reason |
|---|---|---|
| 1 | Microservices behind a single gateway | Clear ownership per domain; independent scaling and deployment |
| 2 | Shared database, one Flyway history per service | Simple local setup without sharing tables between services |
| 3 | RSA-signed JWT + JWKS, delivered in HttpOnly cookies | Services validate tokens without calling auth-service; tokens can't be read by JS |
| 4 | Circuit breaker + fallback on every route | A downstream outage returns a clear message instead of a raw gateway error |
| 5 | Person services provision their own login account | One form creates both the domain record and the user |
| 6 | Parent ↔ Student is many-to-many, owned by parent-service | Siblings and multiple guardians; student-service stays unaware of parents (ADR 0001) |
| 7 | notification-service consumes Kafka events (planned) | An outage never blocks enrollment or provisioning (ADR 0001) |
| 8 | Authorization is role-based; `permissions` is reserved | Roles cover every rule today; avoids two authorization vocabularies (ADR 0002) |

## 7. Security Considerations

- Tokens live in HttpOnly cookies (`app.cookie.secure` and `same-site` are configurable; `Secure=true` is required in production).
- CORS is configured in the gateway only (allowed origin `http://localhost:5173` in development).
- RBAC is enforced per endpoint with `@PreAuthorize` and the shared `Roles` constants.
- The frontend hides actions by role (`RoleRoute`, `useHasAnyRole`), but the backend is always the source of truth.
- The first ADMIN is created by `AdminUserSeeder` from `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`.
- Planned: login rate limiting at the gateway, refresh-token rotation and revocation, and removing default DB credentials from `config-repo`.

## 8. Scalability & Future Considerations

- Services are stateless and discovered through Eureka, so more instances can be added behind the `lb://` routes.
- The shared database can be split into one database per service later without code changes beyond configuration.
- Kafka is ready to carry domain events for notifications and future audit/analytics.
- New domains (parents, grades, attendance) follow the same service template.

## 9. External Services

| Service | Use |
|---|---|
| PostgreSQL | Primary data store |
| Apache Kafka | Domain events (planned) |
| Zipkin | Distributed tracing (`ZIPKIN_URI`) |
| GitHub Actions | CI |

## 10. Environment Setup

**Startup order:** PostgreSQL → `service-registry` → `config-server` → `auth-service` → domain services → `api-gateway` → `admin-server` (optional) → frontend.

```bash
# 1. Database
docker compose -f infrastructure/docker-compose.yml up -d

# 2. Build everything
mvn -B install -DskipTests

# 3. Run each service (from the repo root so config-server finds config-repo)
java -jar applications/service-registry/target/service-registry.jar
java -jar applications/config-server/target/config-server.jar
# ... then auth-service, student/staff/teacher/subject-service, api-gateway

# 4. Frontend
cd applications/frontend-aulix && npm install && npm run dev
```

| Variable | Default | Description |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/aulatech_db` | Use port `5433` with Docker Compose |
| `DB_USERNAME` / `DB_PASSWORD` | — | Database credentials |
| `EUREKA_URI` | `http://localhost:8761/eureka/` | Registry URL |
| `CONFIG_REPO_PATH` | `${user.dir}/infrastructure/config-repo` | Set when not launched from the repo root |
| `AUTH_SERVICE_JWK_URI` | `http://localhost:9000/oauth2/jwks` | JWKS endpoint |
| `JWT_ISSUER` | `http://localhost:9000` | Token issuer |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | `admin@aulix.com` / generated | First admin account |
| `COOKIE_SECURE` / `COOKIE_SAME_SITE` / `COOKIE_DOMAIN` | `false` / `Lax` / — | Cookie flags |
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka |
| `ZIPKIN_URI` | `http://localhost:9411/api/v2/spans` | Tracing |

## 11. Summary

Aulix is a Spring Cloud microservices platform with a React SPA. The gateway secures and routes every request. Each domain service owns its data and enforces RBAC. Shared libraries keep responses, errors and security consistent. The platform foundation, authentication and the student, staff, teacher, subject and admin modules are complete. Parent, Notifications and Quality & Hardening come next (see [TASKS.md](./TASKS.md)).
