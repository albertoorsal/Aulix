CREATE TABLE staff (
    id                  UUID PRIMARY KEY,
    user_id             UUID NOT NULL,
    employee_number     VARCHAR(20) NOT NULL,
    date_of_birth       DATE NOT NULL,
    employment_status   VARCHAR(20) NOT NULL,
    staff_type          VARCHAR(20) NOT NULL,
    hire_date           DATE NOT NULL,
    department          VARCHAR(100) NOT NULL,
    job_title           VARCHAR(100) NOT NULL,
    salary              NUMERIC(12,2) NOT NULL,
    curp                VARCHAR(18) NOT NULL,
    version             BIGINT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_staff_employee_number UNIQUE (employee_number),
    CONSTRAINT uq_staff_user_id UNIQUE (user_id)
);

CREATE INDEX idx_staff_employment_status ON staff (employment_status);
CREATE INDEX idx_staff_staff_type ON staff (staff_type);
CREATE INDEX idx_staff_department ON staff (department);
CREATE INDEX idx_staff_curp ON staff (lower(curp));
