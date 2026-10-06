# ADR 0002: The `permissions` table

- Status: Accepted
- Date: 2026-10-06

## Context

auth-service's V2 migration created `permissions` and `role_permissions` next to `roles`.
`JwtTokenService` already puts a `permissions` claim in every access token, and
security-starter's `RbacJwtAuthenticationConverter` turns each entry into a plain authority
(for `hasAuthority(...)`).

In practice nothing uses them:

- No migration seeds a permission, so `role_permissions` is empty and the claim is always `[]`.
- Every endpoint authorizes with `hasRole(...)` / `hasAnyRole(...)` and the `Roles` constants.
- The frontend stores `permissions` from `/api/auth/verify` but never reads it.

Task 9.8 asked whether to start using permissions or document them as unused.

## Decision

**Keep the tables and the claim, but treat them as reserved. Authorization stays role-based.**

- Do not add permission checks, seeds or an admin UI for permissions now.
- Do not drop the tables: removing them needs a new migration plus changes in `Role`,
  `Permission`, `User.permissionNames()`, `JwtTokenService` and the converter, for no gain.
- The admin module (Phase 9) manages roles only.

## Reasons

- Five roles map cleanly onto every rule in the PRD. Nothing needs finer-grained rights yet.
- Two authorization vocabularies with no consumer would invite inconsistent `@PreAuthorize`
  rules (some by role, some by permission).
- The plumbing already works end to end, so adopting permissions later is cheap.

## Consequences

- The `permissions` claim stays in tokens and is always empty. It costs a few bytes.
- New endpoints must keep using `hasRole` / `hasAnyRole` with `Roles` constants (RULES §6).
- **Revisit** when a rule can't be expressed with roles, for example "STAFF may edit
  subjects but not delete them". At that point: seed permissions in a migration, map them to
  roles in `role_permissions`, switch the affected endpoints to `hasAuthority(...)`, and add a
  permissions view to the admin module.
