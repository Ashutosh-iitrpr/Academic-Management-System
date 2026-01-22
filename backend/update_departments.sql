UPDATE "User" SET "department" = 'Unassigned' WHERE "role" = 'INSTRUCTOR' AND "department" IS NULL;
SELECT * FROM "User" WHERE "role" = 'INSTRUCTOR';
