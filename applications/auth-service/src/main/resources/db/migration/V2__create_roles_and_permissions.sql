CREATE TABLE roles (
    id          UUID PRIMARY KEY,
    version     BIGINT NOT NULL,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP NOT NULL,
    name        VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT uk_roles_name UNIQUE (name)
);

CREATE TABLE permissions (
    id          UUID PRIMARY KEY,
    version     BIGINT NOT NULL,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP NOT NULL,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT uk_permissions_name UNIQUE (name)
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
    role_id       UUID NOT NULL REFERENCES roles(id),
    permission_id UUID NOT NULL REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);
