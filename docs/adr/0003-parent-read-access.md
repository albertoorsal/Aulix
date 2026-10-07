# ADR 0003: How a PARENT reads their children's data

- Status: Accepted
- Date: 2026-10-06
- Extends: [ADR 0001 §3](./0001-phase-0-decisions.md#3-parent-model)

## Context

ADR 0001 says a PARENT may read a student only if a `parent_student` row links them, and that
parent-service owns those rows. The "My children" portal (task 10.9) shows each child's record and
enrolled subjects. That data lives in three other services:

- student number, grade and status in **student-service**,
- name and email on the student's user account in **auth-service**,
- enrollments in **subject-service**.

Service-to-service calls forward the caller's own token (`AuthHeaderForwardingInterceptor`), and
there is no service account. Before this change, all three services rejected the PARENT role.

## Options considered

1. **Downstream link check.** student-service and subject-service accept PARENT on specific read
   endpoints, but first ask parent-service whether the student is linked to the caller.
2. **Service account token.** parent-service checks the link itself, then reads the other services
   with a client-credentials token from auth-service.
3. **Gateway-only block.** Downstream endpoints accept PARENT, and the gateway refuses PARENT on
   `/api/students/**` and `/api/subjects/**`.

Option 3 depends on the gateway alone, which goes against the rule that every service validates the
caller itself (`GatewaySecurityConfig`). Option 2 means adding a new grant, a shared secret and a
credential that can read everything.

## Decision

Use **option 1**.

- parent-service exposes `GET /api/parents/me/students/{studentId}`. It resolves the parent from
  the token's `sub` and returns 200 when the student is linked and 404 when it isn't. It never
  loads the student itself, because student-service calls this endpoint and that would loop.
- student-service `GET /api/students/{id}` and subject-service
  `GET /api/subjects/students/{studentId}` use this rule:
  `hasAnyRole(ADMIN, STAFF, TEACHER) or (hasRole(PARENT) and @parentClient.isLinkedToCurrentParent(id))`.
  Any 4xx from parent-service denies. A 5xx or an outage fails closed with a 502.
- **auth-service `POST /api/users/batch` accepts PARENT.** student-service uses it, with the
  parent's token, to add the child's name. When the caller has PARENT and none of
  ADMIN/STAFF/TEACHER, auth-service returns only STUDENT accounts.
- The parent's own name and email for `/api/parents/me` come from the token's profile claims, so
  parent-service never needs a user lookup for a PARENT.

ADR 0001 said "other services never see parent data". That still holds: student-service and
subject-service only receive a yes/no answer and store nothing about parents.

## Consequences

- No privileged credential exists, and each service still authorizes the caller itself.
- A PARENT request costs one extra call per student read (student-service → parent-service).
  Parents have only a few children, so this is acceptable.
- student-service and subject-service now depend on parent-service for PARENT reads only. Other
  roles never trigger the call, because the `or` short-circuits.
- **Accepted risk:** a PARENT who somehow learns another student's *user* id can read that
  student's name and email through `/api/users/batch`. User ids are random UUIDs and are exposed
  only by student endpoints that are already link-checked. This is tracked as a Known Issue for
  Phase 12, where a service credential or a linked-ids-only batch filter can close it.
- Deleting a student does not delete its `parent_student` rows. The portal and the admin page show
  such a link as "record unavailable" so it can be unlinked. Cleaning these up through
  `student-events` belongs with Phase 11.
