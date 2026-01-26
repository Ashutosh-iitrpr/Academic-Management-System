-- Create a test admin user (skip if already exists)
INSERT INTO "User" (id, email, name, role, "isActive", "entryNumber", "createdAt")
VALUES (
  gen_random_uuid(),
  '2023csb1101+admin@iitrpr.ac.in',
  'Admin User',
  'ADMIN',
  true,
  NULL,
  NOW()
)
ON CONFLICT (email) DO NOTHING;
