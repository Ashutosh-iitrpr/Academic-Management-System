-- Seed a test instructor
INSERT INTO "User" (id, email, name, role, "isActive", "entryNumber", "department", "createdAt")
VALUES (gen_random_uuid(), 'instructor@iitrpr.ac.in', 'Test Instructor', 'INSTRUCTOR', true, NULL, 'CSE', NOW())
ON CONFLICT (email) DO NOTHING;
