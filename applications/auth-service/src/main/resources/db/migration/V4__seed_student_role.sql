INSERT INTO roles (id, version, created_at, updated_at, name, description)
VALUES
    (gen_random_uuid(), 0, now(), now(), 'STUDENT', 'Student')
ON CONFLICT (name) DO NOTHING;
