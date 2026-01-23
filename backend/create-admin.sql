-- Create a test admin user (skip if already exists)
INSERT INTO "User" (id, email, name, role, "isActive", "entryNumber", "createdAt")
VALUES (
  gen_random_uuid(),
  'admin@test.com',
  'Admin User',
  'ADMIN',
  true,
  NULL,
  NOW()
)
ON CONFLICT (email) DO NOTHING;
