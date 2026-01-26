# Concentration & Minor Enrollment Implementation Summary

## Overview
Implemented a comprehensive feature allowing students to enroll in concentration and minor courses with the following constraints and behaviors:
- Students can choose **either** concentration **OR** minor (not both)
- Concentration and minor courses require **instructor approval only** (not auto-approved)
- GPA calculations are **separated** for main courses, concentration, and minor
- **Audit courses are excluded** from all GPA calculations
- Concentration and minor courses **don't count against credit limit**

---

## Backend Changes

### 1. Database Migration
**File:** `backend/prisma/migrations/20260125_add_concentration_minor_constraint/migration.sql`
- Created PostgreSQL function `check_concentration_minor_exclusivity()` to enforce the constraint
- Added trigger on Enrollment table to prevent students from having both CONCENTRATION and MINOR enrollments simultaneously
- Checks active statuses: PENDING_INSTRUCTOR, ENROLLED, AUDIT, COMPLETED

### 2. Enrollment Service Validation
**File:** `backend/src/modules/enrollments/enrollments.service.ts`

#### Added exclusivity validation in `requestEnrollment()` method:
```typescript
// Lines 70-96: Validates concentration/minor exclusivity
if (dto.enrollmentType === 'CREDIT_CONCENTRATION' || dto.enrollmentType === 'CREDIT_MINOR') {
  const oppositeType = dto.enrollmentType === 'CREDIT_CONCENTRATION' ? 'CREDIT_MINOR' : 'CREDIT_CONCENTRATION';
  const hasOpposite = await this.prisma.enrollment.findFirst({
    where: {
      studentId,
      enrollmentType: oppositeType,
      status: { in: [PENDING_INSTRUCTOR, ENROLLED, AUDIT, COMPLETED] }
    }
  });
  if (hasOpposite) {
    throw new BadRequestException("Cannot request... Student already has... enrollments");
  }
}
```

#### Updated credit limit check (lines 98-122):
- Now **only counts CREDIT type enrollments** against the credit limit
- Concentration and minor courses **bypass credit limit** as they're optional

### 3. Student Records Service - GPA Calculation
**File:** `backend/src/modules/student-records/student-records.service.ts`

#### Updated `getStudentRecord()` method:
- Replaced single GPA tracking with **three separate tracking systems**:
  - `mainGradePoints / mainCreditsAttempted` → Main GPA
  - `concentrationGradePoints / concentrationCreditsAttempted` → Concentration GPA
  - `minorGradePoints / minorCreditsAttempted` → Minor GPA

- **Audit courses excluded** from GPA calculation (checked: `e.status !== EnrollmentStatus.AUDIT`)
- Returns new summary fields:
  ```typescript
  summary: {
    mainGPA: 0.00,
    concentrationGPA: 0.00,
    minorGPA: 0.00,
    cgpa: 0.00, // Still main GPA for backward compatibility
    currentSemesterGPA: 0.00
  }
  ```

#### Updated `getTranscript()` method:
- Separated course tracking by enrollment type
- Semesters now return separate GPA data:
  ```typescript
  {
    main: { semesterGPA, semesterCreditsEarned },
    concentration: { semesterGPA, semesterCreditsEarned },
    minor: { semesterGPA, semesterCreditsEarned }
  }
  ```
- Cumulative section returns:
  ```typescript
  cumulative: {
    main: { CGPA, totalCreditsEarned },
    concentration: { CGPA, totalCreditsEarned },
    minor: { CGPA, totalCreditsEarned }
  }
  ```

---

## Frontend Changes

### 1. API Types Update
**File:** `frontend/lib/api/studentApi.ts`
- Extended `StudentRecord.summary` interface with:
  - `mainGPA: number`
  - `concentrationGPA: number`
  - `minorGPA: number`

### 2. Student Dashboard
**File:** `frontend/app/student/dashboard/page.tsx`

#### Updated AcademicStats interface:
```typescript
interface AcademicStats {
  totalEnrollments: number;
  creditsEarned: number;
  mainGPA: number;
  concentrationGPA: number;
  minorGPA: number;
  cgpa: number;
  currentSemesterGPA: number;
}
```

#### Display enhancements:
- Displays **Main GPA** card (primary stat)
- Displays **Current Semester GPA** card
- **Conditionally shows Concentration and Minor GPA cards** only if values > 0
- Uses different colors: warning for concentration, error for minor

### 3. Student Record Page
**File:** `frontend/app/student/record/page.tsx`

#### Updated stat cards:
- Changed from "CGPA" to "Main GPA" with subtitle "Core Courses"
- Added **conditional rendering** of Concentration and Minor GPA cards
- Displays separate cards only when student has enrollment in those types

---

## Behavior Changes

### Enrollment Request Flow
1. **Student requests concentration/minor enrollment**:
   - System checks if student already has opposite type (concentration or minor)
   - Rejects if opposite type exists with active status
   - Credit limit check **ignores** concentration/minor courses

2. **Instructor approval**:
   - Concentration and minor enrollments stay in PENDING_INSTRUCTOR until approved by instructor
   - Instructor must explicitly approve these enrollments
   - Once approved, move to ENROLLED status

3. **Audit handling**:
   - When course is set to AUDIT status, it's still tracked but **excluded from GPA**
   - Audit courses don't affect credit limit either

### GPA Calculation
- **Main GPA**: Only CREDIT type completed courses, excluding AUDIT
- **Concentration GPA**: Only CREDIT_CONCENTRATION completed courses, excluding AUDIT
- **Minor GPA**: Only CREDIT_MINOR completed courses, excluding AUDIT
- **Current Semester GPA**: Only main courses from current semester (AUDIT excluded)

---

## Testing Recommendations

### Backend Testing
1. ✅ Try enrolling in concentration, then minor → Should reject
2. ✅ Try enrolling in minor, then concentration → Should reject  
3. ✅ Try concentration + multiple main courses exceeding credit limit → Main should fail, concentration succeeds
4. ✅ Grade completion with audit course → Verify audit doesn't count in GPA

### Frontend Testing
1. ✅ Student dashboard shows main GPA only initially
2. ✅ After concentration enrollment approval, concentration GPA appears
3. ✅ After minor enrollment approval, minor GPA appears
4. ✅ Both concentration and minor GPAs don't appear together
5. ✅ Student record page shows all three GPAs with proper formatting

---

## Database Schema Notes
- Existing `EnrollmentType` enum already had: `CREDIT`, `CREDIT_CONCENTRATION`, `CREDIT_MINOR`
- New migration creates constraint via PostgreSQL trigger function
- `EnrollmentStatus` unchanged: still uses `PENDING_INSTRUCTOR` for initial requests

---

## Backward Compatibility
- `cgpa` field still returned in summary (equals mainGPA)
- All CREDIT type calculations remain unchanged
- Existing student records without concentration/minor show 0.00 for those GPAs

