CREATE TABLE users (
    id             UUID PRIMARY KEY,
    version        BIGINT NOT NULL,
    created_at     TIMESTAMP NOT NULL,
    updated_at     TIMESTAMP NOT NULL,
    email          VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    first_name     VARCHAR(100) NOT NULL,
    last_name      VARCHAR(100) NOT NULL,
    enabled        BOOLEAN NOT NULL,
    account_locked BOOLEAN NOT NULL,
    CONSTRAINT uk_users_email UNIQUE (email)
);
