CREATE TABLE subject (
    id                      UUID PRIMARY KEY,
    code                    VARCHAR(20) NOT NULL,
    name                    VARCHAR(150) NOT NULL,
    description             VARCHAR(1000),
    credit_hours            INTEGER NOT NULL,
    status                  VARCHAR(20) NOT NULL,
    version                 BIGINT NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_subject_code UNIQUE (code)
);

CREATE INDEX idx_subject_status ON subject (status);
CREATE INDEX idx_subject_code ON subject (lower(code));
CREATE INDEX idx_subject_name ON subject (lower(name));

CREATE TABLE subject_teacher (
    id                      UUID PRIMARY KEY,
    subject_id              UUID NOT NULL REFERENCES subject (id),
    teacher_id              UUID NOT NULL,
    version                 BIGINT NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_subject_teacher UNIQUE (subject_id, teacher_id)
);

CREATE INDEX idx_subject_teacher_subject_id ON subject_teacher (subject_id);
CREATE INDEX idx_subject_teacher_teacher_id ON subject_teacher (teacher_id);

CREATE TABLE subject_student (
    id                      UUID PRIMARY KEY,
    subject_id              UUID NOT NULL REFERENCES subject (id),
    student_id              UUID NOT NULL,
    version                 BIGINT NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_subject_student UNIQUE (subject_id, student_id)
);

CREATE INDEX idx_subject_student_subject_id ON subject_student (subject_id);
CREATE INDEX idx_subject_student_student_id ON subject_student (student_id);
