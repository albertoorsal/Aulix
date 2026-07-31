CREATE TABLE students (
    id                  UUID PRIMARY KEY,
    user_id             UUID NOT NULL,
    student_number      VARCHAR(20) NOT NULL,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    date_of_birth       DATE NOT NULL,
    enrollment_status   VARCHAR(20) NOT NULL,
    enrollment_date     DATE NOT NULL,
    grade_level         INTEGER NOT NULL,
    curp         VARCHAR(18) NOT NULL,
    version             BIGINT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_students_student_number UNIQUE (student_number),
    CONSTRAINT uq_students_user_id UNIQUE (user_id)
);

CREATE INDEX idx_students_email ON students (lower(email));
CREATE INDEX idx_students_enrollment_status ON students (enrollment_status);
CREATE INDEX idx_students_grade_level ON students (grade_level);
CREATE INDEX idx_students_name ON students (lower(first_name), lower(last_name));
CREATE INDEX idx_students_curp ON students (lower(curp));
