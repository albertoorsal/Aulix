# ADR 0001: Phase 0 platform decisions

- Status: Accepted
- Date: 2026-09-26

## 1. Notification service

**Decision:** Build `notification-service` in Phase 4. Until it exists, the gateway carries
no configuration for it.

- The `notificationServiceCircuitBreaker` instance was removed from
  `infrastructure/config-repo/api-gateway.yml`. It had no route, no fallback and no service.
- In Phase 4, add the route, the circuit-breaker instance, and a `/fallback/notification`
  handler in `FallbackController` at the same time as the service. The other routes show the
  pattern.
- Services already publish domain events to Kafka (`user-events`, `student-events`). The
  notification service should consume those topics rather than be called synchronously, so an
  outage never blocks enrolment or user provisioning.

## 2. Gateway circuit breakers and fallbacks

**Decision:** Every gateway route goes through a Resilience4j `CircuitBreaker` filter that
forwards to `/fallback/{service}`.

- Before this change, the breaker instances were declared but never attached to a route, and
  `FallbackController` had no endpoints, so a downstream outage reached the client as a raw
  gateway error.
- Routes and their fallbacks:

  | Route             | Breaker                                  | Fallback            |
  |-------------------|------------------------------------------|---------------------|
  | `/api/students/**`| `studentServiceCircuitBreaker`           | `/fallback/student` |
  | `/api/staff/**`   | `staffServiceCircuitBreaker`             | `/fallback/staff`   |
  | `/api/teachers/**`| `teacherServiceCircuitBreaker`           | `/fallback/teacher` |
  | `/api/subjects/**`| `subjectServiceCircuitBreaker`           | `/fallback/subject` |
  | `/api/auth/**`    | `authServiceCircuitBreaker`              | `/fallback/auth`    |
  | `/api/users/**`   | `authServiceCircuitBreaker` (same host)  | `/fallback/user`    |

- The breaker trips only on connection errors and timeouts, not on 4xx or 5xx responses, so
  validation and business-rule errors pass through unchanged.
- Time limits are 10s for the domain services and 5s for auth. The shared default of 3s is
  too tight for requests that call other services synchronously, such as creating a student
  (which provisions its user account).

## 3. Parent model

**Decision:** Parents and students are linked **many-to-many**.

- One parent can have several children at the school (siblings).
- One student can have several guardians (two parents, separated households, legal guardians).
- The relationship carries its own attributes, so it is a real entity, not a bare join table.

Planned shape for `parent-service`, which owns the link (student-service stays unaware of
parents):

```sql
CREATE TABLE parent (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID UNIQUE,             -- account in auth-service, role PARENT
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    phone       VARCHAR(30),
    -- BaseEntity audit columns
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP
);

CREATE TABLE parent_student (
    parent_id        UUID NOT NULL REFERENCES parent(id) ON DELETE CASCADE,
    student_id       UUID NOT NULL,           -- lives in student-service; validated via StudentClient
    relationship     VARCHAR(30) NOT NULL,    -- MOTHER, FATHER, GUARDIAN, OTHER
    primary_contact  BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (parent_id, student_id)
);
CREATE INDEX idx_parent_student_student ON parent_student(student_id);
```

- `student_id` has no foreign key because it lives in another service's schema. The link is
  validated through `StudentClient` when it is created, the same way subject-service
  validates teacher and student assignments.
- Authorization rule: a user with only the `PARENT` role may read a student only if a
  `parent_student` row links them. This is enforced in parent-service; other services never
  see parent data.

## 4. Continuous integration

**Decision:** GitHub Actions (`.github/workflows/ci.yml`) runs on every push to `main` and on
every pull request.

- **Backend:** `mvn install -DskipTests`, then start config-server from the built jar, then
  `mvn verify`.
  - Postgres 16 and Kafka run as service containers, so the `@SpringBootTest` context tests
    boot each service for real, including its Flyway migrations on an empty database.
  - Surefire reports are uploaded when a run fails.
- **Frontend:** `npm ci`, `npm run lint`, `npm run build`.
  - The shadcn/ui output (`src/components/ui`, `src/hooks/use-mobile.ts`) is excluded from
    ESLint because it is generated.

Phase 5 builds on this pipeline by adding real unit and integration tests and Testcontainers
(its BOM is already imported in the root `pom.xml`).
