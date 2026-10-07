-- Name and email live on the user account in auth-service (same as student/staff/teacher),
-- so the parent row only keeps the account reference and parent-specific data.
CREATE TABLE parent (
    id                      UUID PRIMARY KEY,
    user_id                 UUID NOT NULL,
    phone                   VARCHAR(30),
    version                 BIGINT NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_parent_user_id UNIQUE (user_id)
);

-- Many-to-many parent <-> student (ADR 0001 §3). student_id lives in student-service, so it
-- has no foreign key; it is validated through StudentClient when the link is created.
CREATE TABLE parent_student (
    id                      UUID PRIMARY KEY,
    parent_id               UUID NOT NULL REFERENCES parent (id) ON DELETE CASCADE,
    student_id              UUID NOT NULL,
    relationship            VARCHAR(20) NOT NULL,
    primary_contact         BOOLEAN NOT NULL DEFAULT FALSE,
    version                 BIGINT NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_parent_student UNIQUE (parent_id, student_id)
);

CREATE INDEX idx_parent_student_parent_id ON parent_student (parent_id);
CREATE INDEX idx_parent_student_student_id ON parent_student (student_id);
