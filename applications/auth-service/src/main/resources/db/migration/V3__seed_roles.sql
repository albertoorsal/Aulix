INSERT INTO roles (id, version, created_at, updated_at, name, description)
VALUES
    (gen_random_uuid(), 0, now(), now(), 'ADMIN', 'Full administrative access'),
    (gen_random_uuid(), 0, now(), now(), 'STAFF', 'School staff member'),
    (gen_random_uuid(), 0, now(), now(), 'TEACHER', 'Teacher'),
    (gen_random_uuid(), 0, now(), now(), 'PARENT', 'Parent or guardian')
ON CONFLICT (name) DO NOTHING;
