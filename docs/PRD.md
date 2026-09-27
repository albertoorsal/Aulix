# 📄 Product Requirements Document (PRD)

## Aulix – School Management Platform

---

| | |
|---|---|
| **Version:** | 1.0 |
| **Date:** | Sep 27, 2026 |
| **Author:** | Alberto Ornelas |
| **Status:** | In Development |
| **Target Launch:** | MVP (v1.0) |

---

## 1. Product Overview

Aulix is a web-based school management platform. It gives a school one place to manage its people (students, staff, teachers and parents), its academic catalog (subjects), and who teaches or studies each subject. Access is controlled by role, so each user sees only what they are allowed to see and change.

Aulix is built as a set of Spring Boot microservices behind an API gateway, with a React single-page application as the client.

## 2. Problem Statement

Small and mid-sized schools often keep student records, staff lists, teacher assignments and subject enrollments in spreadsheets, paper forms and disconnected tools. This causes:

- Duplicate and inconsistent data about the same person.
- No clear control over who can view or edit sensitive records.
- Manual, error-prone work to assign teachers and enroll students in subjects.
- No self-service view for parents who want to see their children's information.

Aulix replaces these scattered tools with one secure, role-aware system.

## 3. Goals

- Provide a single source of truth for students, staff, teachers, parents and subjects.
- Enforce role-based access control (RBAC) on every request, in the backend and in the UI.
- Make everyday administrative tasks (create, search, edit, assign, enroll) fast and simple.
- Give parents a read-only portal to follow their children.
- Keep the platform resilient: one failing service must not take the whole system down.
- Offer a clean, modern and consistent user experience.

### Success Metrics

| Metric | Target |
|---|---|
| Time to register a new student (with login account) | < 1 minute |
| Unauthorized access to another role's data | 0 incidents |
| Downstream outage surfaced as a clear message (not a raw error) | 100% of gateway routes |
| CI pipeline green on `main` | Always |

## 4. Target Users

| Role | Description | Main Needs |
|---|---|---|
| **ADMIN** | School administrator or IT owner | Full control: users, roles, staff, teachers, students, subjects, audit |
| **STAFF** | Office / administrative staff | Manage students, parents and subjects; assign teachers; enroll students |
| **TEACHER** | Teaching staff | View their subjects, enrolled students and colleagues |
| **PARENT** | Parent or legal guardian | View their own children and the subjects they are enrolled in |
| **STUDENT** | Enrolled student | View subjects (future: own schedule and grades) |

- Uses a laptop or desktop browser at school; mobile use for parents.
- Needs a simple, reliable tool with clear feedback on every action.

## 5. Core Features (MVP)

1. **User Authentication** – Login, logout, token refresh and session verification, using HttpOnly cookies and RSA-signed JWTs. ✅
2. **Role-Based Access Control** – Roles ADMIN, STAFF, TEACHER, PARENT and STUDENT enforced by every service and by frontend route guards. ✅
3. **Dashboard** – Authenticated layout with a collapsible sidebar and role-aware navigation. ✅
4. **Student Management** – Create (with login account), search, edit and delete students. ✅
5. **Staff Management** – Create (with login account), search, edit and delete staff members. ✅
6. **Teacher Management** – Create (with login account), search, edit and delete teachers. ✅
7. **Subject Management** – Subject catalog with search, status filter, teacher assignment and student enrollment. ✅
8. **Admin Module** – User administration: search, enable/disable, delete, assign/revoke roles, audit log. ⏳
9. **Parent Module** – Parent management, parent–student links (many-to-many), and a "My children" portal. ⏳
10. **Notifications** – In-app notifications for key events, with an unread bell in the header. ⏳ *(optional)*

✅ Done · ⏳ Planned

## 6. User Stories

| # | As a… | I want to… | So that… |
|---|---|---|---|
| US-01 | User | log in with my email and password | I can access the features for my role |
| US-02 | Admin / Staff | register a student and create their account in one step | I don't enter the same data twice |
| US-03 | Admin | manage staff and teachers | the school's personnel list is always accurate |
| US-04 | Admin / Staff | create subjects and assign teachers to them | each subject has its teachers |
| US-05 | Admin / Staff | enroll students in subjects | enrollment is tracked in one place |
| US-06 | Teacher | view subjects and their members | I know who is in my classes |
| US-07 | Admin | enable, disable and change the roles of any account | I control who can access the platform |
| US-08 | Admin / Staff | link parents to students | guardians can follow their children |
| US-09 | Parent | see my children and their subjects | I stay informed without calling the school |
| US-10 | User | receive notifications about relevant events | I don't miss important changes |

## 7. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Authentication uses HttpOnly cookies carrying RSA-signed JWT access and refresh tokens. | High |
| FR-02 | Every API endpoint checks the caller's role with `@PreAuthorize`. | High |
| FR-03 | Creating a student, staff member, teacher or parent also provisions their login account in auth-service with the matching role. | High |
| FR-04 | Every list screen supports search and pagination. | High |
| FR-05 | Subject assignment and enrollment validate that the teacher or student exists and reject duplicates. | High |
| FR-06 | A PARENT user can read only the students linked to them. | High |
| FR-07 | The gateway returns a clear fallback response when a downstream service is unavailable. | High |
| FR-08 | Role changes and account enable/disable events are recorded in an audit log. | Medium |
| FR-09 | Users receive in-app notifications for key events. | Low |

## 8. Non-Functional Requirements

- **Security:** Tokens are never readable from JavaScript (HttpOnly cookies). Passwords are hashed. Secrets come from environment variables.
- **Resilience:** Every gateway route has a Resilience4j circuit breaker and a fallback.
- **Performance:** List endpoints are paginated. Typical API responses take less than 500 ms.
- **Maintainability:** Every service follows the same layered structure. Schema changes go through Flyway migrations only.
- **Observability:** Health, metrics (Prometheus) and tracing (Zipkin) endpoints exist on every service.
- **Quality:** CI builds every module and runs its tests on each push and pull request.

## 9. Out of Scope (MVP)

- Grades, attendance, timetables and report cards.
- Payments and tuition.
- Native mobile apps.
- Multi-school (multi-tenant) support.
- Self-service registration for students and parents (accounts are created by staff).

## 10. Future Enhancements

- Grades and attendance tracking per subject.
- Class schedules and a calendar view.
- Email delivery for notifications.
- Fine-grained permissions on top of roles.
- Parent–teacher messaging.
- Reports and analytics dashboards.
