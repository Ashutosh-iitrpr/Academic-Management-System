-- Add constraint: Student cannot have both CONCENTRATION and MINOR enrollments
-- This prevents a student from enrolling in both concentration and minor courses

-- Create a function to check the constraint
CREATE OR REPLACE FUNCTION check_concentration_minor_exclusivity()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new enrollment is CREDIT_CONCENTRATION, check if student has any CREDIT_MINOR
  IF NEW."enrollmentType" = 'CREDIT_CONCENTRATION' THEN
    IF EXISTS (
      SELECT 1 FROM "Enrollment"
      WHERE "studentId" = NEW."studentId"
        AND "enrollmentType" = 'CREDIT_MINOR'
        AND "status" IN ('PENDING_INSTRUCTOR', 'ENROLLED', 'AUDIT', 'COMPLETED')
        AND id != COALESCE(NEW.id, '')
    ) THEN
      RAISE EXCEPTION 'Student cannot enroll in both concentration and minor courses';
    END IF;
  -- If the new enrollment is CREDIT_MINOR, check if student has any CREDIT_CONCENTRATION
  ELSIF NEW."enrollmentType" = 'CREDIT_MINOR' THEN
    IF EXISTS (
      SELECT 1 FROM "Enrollment"
      WHERE "studentId" = NEW."studentId"
        AND "enrollmentType" = 'CREDIT_CONCENTRATION'
        AND "status" IN ('PENDING_INSTRUCTOR', 'ENROLLED', 'AUDIT', 'COMPLETED')
        AND id != COALESCE(NEW.id, '')
    ) THEN
      RAISE EXCEPTION 'Student cannot enroll in both concentration and minor courses';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS check_concentration_minor_exclusivity_trigger ON "Enrollment";

CREATE TRIGGER check_concentration_minor_exclusivity_trigger
BEFORE INSERT OR UPDATE ON "Enrollment"
FOR EACH ROW
EXECUTE FUNCTION check_concentration_minor_exclusivity();
