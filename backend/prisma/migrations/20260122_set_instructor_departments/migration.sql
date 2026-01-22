-- Set default department for existing instructors who don't have one
UPDATE "User" SET "department" = 'Unassigned' WHERE "role" = 'INSTRUCTOR' AND "department" IS NULL;
