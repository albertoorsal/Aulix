-- Who changed what on a user account. target_user_id has no foreign key on purpose:
-- entries must survive the deletion of the user they describe.
CREATE TABLE audit_log (
    id             UUID PRIMARY KEY,
    version        BIGINT NOT NULL,
    created_at     TIMESTAMP NOT NULL,
    updated_at     TIMESTAMP NOT NULL,
    action         VARCHAR(50) NOT NULL,
    actor_id       UUID,
    actor_email    VARCHAR(255),
    target_user_id UUID NOT NULL,
    target_email   VARCHAR(255) NOT NULL,
    details        VARCHAR(255)
);

CREATE INDEX idx_audit_log_target_user_id ON audit_log (target_user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log (created_at DESC);
