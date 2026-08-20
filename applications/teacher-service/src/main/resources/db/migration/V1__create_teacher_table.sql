CREATE TABLE teacher (
    id                      UUID PRIMARY KEY,
    user_id                 UUID NOT NULL,
    employee_number         VARCHAR(20) NOT NULL,
    date_of_birth           DATE NOT NULL,
    employment_status       VARCHAR(20) NOT NULL,
    teacher_type            VARCHAR(20) NOT NULL,
    hire_date               DATE NOT NULL,
    department              VARCHAR(100) NOT NULL,
    subject_specialization  VARCHAR(100) NOT NULL,
    salary                  NUMERIC(12,2) NOT NULL,
    curp                    VARCHAR(18) NOT NULL,
    version                 BIGINT NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_teacher_employee_number UNIQUE (employee_number),
    CONSTRAINT uq_teacher_user_id UNIQUE (user_id)
);

CREATE INDEX idx_teacher_employment_status ON teacher (employment_status);
CREATE INDEX idx_teacher_teacher_type ON teacher (teacher_type);
CREATE INDEX idx_teacher_department ON teacher (department);
CREATE INDEX idx_teacher_curp ON teacher (lower(curp));
