import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { EnrollmentStatus } from "@prisma/client";
import { GRADE_POINTS } from "src/constants/grades.constants";
import { AcademicCalendarService } from "src/common/services/academic-calendar.service";

type CourseSummary = {
  courseCode: string;
  courseName: string;
  credits: number;
  enrollmentType: string;
  status: string;
  grade?: string;
  instructor: string;
};

type SemesterBucket = {
  ongoing: CourseSummary[];
  completed: CourseSummary[];
  dropped: CourseSummary[];
  creditsEarned: number;
  creditsRegistered: number;
};

@Injectable()
export class StudentRecordsService {
  constructor(
    private prisma: PrismaService,
    private academicCalendarService: AcademicCalendarService,
  ) {}

  async getStudentRecord(studentId: string) {
    // 1️⃣ Fetch student
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student || !student.entryNumber) {
      throw new NotFoundException("Student not found");
    }

    const admissionYear = student.entryNumber.slice(0, 4);
    const branch = student.entryNumber.slice(4, 7);

    // 2️⃣ Fetch all enrollments
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        courseOffering: {
          include: {
            course: true,
            instructor: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // ✅ FIX 1: Explicit typing
    const semesterWiseEnrollments: Record<string, SemesterBucket> = {};

    let cumulativeCreditsCompleted = 0;
    let creditsOngoing = 0;
    
    // Separate GPA tracking for main (CREDIT), concentration, and minor
    let mainGradePoints = 0;
    let mainCreditsAttempted = 0;
    let mainCreditsEarned = 0;
    
    let concentrationGradePoints = 0;
    let concentrationCreditsAttempted = 0;
    let concentrationCreditsEarned = 0;
    
    let minorGradePoints = 0;
    let minorCreditsAttempted = 0;
    let minorCreditsEarned = 0;
    
    let currentSemesterMainGradePoints = 0;
    let currentSemesterMainCreditsEarned = 0;
    let currentSemesterCredits = 0;

    // Get all unique semesters to find current semester
    const allSemesters = [...new Set(enrollments.map(e => e.courseOffering.semester))];
    const currentSemesterName = await this.academicCalendarService.getCurrentSemesterName();
    
    // Use the semester from academic calendar if it exists in enrollments
    // Otherwise use the last semester (for students with no current enrollment)
    const currentSemester = allSemesters.includes(currentSemesterName)
      ? currentSemesterName
      : allSemesters[allSemesters.length - 1] || currentSemesterName;

    for (const e of enrollments) {
      const semester = e.courseOffering.semester;
      const course = e.courseOffering.course;
      const grade = e.grade as string;

      if (!semesterWiseEnrollments[semester]) {
        semesterWiseEnrollments[semester] = {
          ongoing: [],
          completed: [],
          dropped: [],
          creditsEarned: 0,
          creditsRegistered: 0,
        };
      }

      const courseSummary: CourseSummary = {
        courseCode: course.code,
        courseName: course.name,
        credits: course.credits,
        enrollmentType: e.enrollmentType,
        status: e.status,
        grade: e.grade ?? undefined,
        instructor: e.courseOffering.instructor.name,
      };

      if (e.status === EnrollmentStatus.COMPLETED) {
        semesterWiseEnrollments[semester].completed.push(courseSummary);
        semesterWiseEnrollments[semester].creditsEarned += course.credits;
        cumulativeCreditsCompleted += course.credits;

        // Calculate GPA for completed courses
        const gradePoints = GRADE_POINTS[grade] ?? 0;
        
        // Separate by enrollment type
        if (e.enrollmentType === 'CREDIT') {
          mainGradePoints += gradePoints * course.credits;
          mainCreditsAttempted += course.credits;
          mainCreditsEarned += course.credits;
          
          if (semester === currentSemester) {
            currentSemesterMainGradePoints += gradePoints * course.credits;
            currentSemesterMainCreditsEarned += course.credits;
          }
        } else if (e.enrollmentType === 'CREDIT_CONCENTRATION') {
          concentrationGradePoints += gradePoints * course.credits;
          concentrationCreditsAttempted += course.credits;
          concentrationCreditsEarned += course.credits;
        } else if (e.enrollmentType === 'CREDIT_MINOR') {
          minorGradePoints += gradePoints * course.credits;
          minorCreditsAttempted += course.credits;
          minorCreditsEarned += course.credits;
        }
      }

      if (
        e.status === EnrollmentStatus.ENROLLED ||
        e.status === EnrollmentStatus.AUDIT
      ) {
        semesterWiseEnrollments[semester].ongoing.push(courseSummary);
        semesterWiseEnrollments[semester].creditsRegistered += course.credits;
        creditsOngoing += course.credits;

        // Track current semester ongoing credits (only non-audit)
        if (semester === currentSemester && e.status !== EnrollmentStatus.AUDIT) {
          currentSemesterCredits += course.credits;
        }
      }

      if (e.status === EnrollmentStatus.DROPPED) {
        semesterWiseEnrollments[semester].dropped.push(courseSummary);
      }
    }

    // Calculate CGPA for main courses only
    const cgpa = mainCreditsAttempted > 0
      ? parseFloat((mainGradePoints / mainCreditsAttempted).toFixed(2))
      : 0;

    // Calculate current semester GPA for main courses only
    const currentSemesterGPA = currentSemesterMainCreditsEarned > 0
      ? parseFloat((currentSemesterMainGradePoints / currentSemesterMainCreditsEarned).toFixed(2))
      : 0;
    
    // Calculate separate GPA for concentration
    const concentrationGPA = concentrationCreditsAttempted > 0
      ? parseFloat((concentrationGradePoints / concentrationCreditsAttempted).toFixed(2))
      : 0;
    
    // Calculate separate GPA for minor
    const minorGPA = minorCreditsAttempted > 0
      ? parseFloat((minorGradePoints / minorCreditsAttempted).toFixed(2))
      : 0;

    return {
      student: {
        name: student.name,
        entryNumber: student.entryNumber,
        branch,
        admissionYear,
      },
      semesterWiseEnrollments,
      summary: {
        cumulativeCreditsCompleted,
        creditsOngoing,
        totalEnrollments: enrollments.length,
        mainGPA: cgpa,
        concentrationGPA,
        minorGPA,
        cgpa,
        currentSemesterGPA,
      },
    };
  }

  async getStudentRecordBySemester(
    studentId: string,
    semester: string,
  ) {
    // 1️⃣ Fetch student
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student || !student.entryNumber) {
      throw new NotFoundException("Student not found");
    }

    // 2️⃣ Fetch enrollments
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        studentId,
        courseOffering: { semester },
      },
      include: {
        courseOffering: {
          include: {
            course: true,
            instructor: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (enrollments.length === 0) {
      return {
        semester,
        message: "No enrollments found for this semester",
        courses: {
          ongoing: [],
          completed: [],
          dropped: [],
        },
        summary: {
          creditsEarned: 0,
          creditsRegistered: 0,
        },
      };
    }

    // ✅ FIX 2: Explicit typing
    const courses: {
      ongoing: CourseSummary[];
      completed: CourseSummary[];
      dropped: CourseSummary[];
    } = {
      ongoing: [],
      completed: [],
      dropped: [],
    };

    let creditsEarned = 0;
    let creditsRegistered = 0;

    for (const e of enrollments) {
      const course = e.courseOffering.course;

      const courseSummary: CourseSummary = {
        courseCode: course.code,
        courseName: course.name,
        credits: course.credits,
        enrollmentType: e.enrollmentType,
        status: e.status,
        grade: e.grade ?? undefined,
        instructor: e.courseOffering.instructor.name,
      };

      if (e.status === EnrollmentStatus.COMPLETED) {
        courses.completed.push(courseSummary);
        creditsEarned += course.credits;
      }

      if (
        e.status === EnrollmentStatus.ENROLLED ||
        e.status === EnrollmentStatus.AUDIT
      ) {
        courses.ongoing.push(courseSummary);
        creditsRegistered += course.credits;
      }

      if (e.status === EnrollmentStatus.DROPPED) {
        courses.dropped.push(courseSummary);
      }
    }

    return {
      semester,
      courses,
      summary: {
        creditsEarned,
        creditsRegistered,
      },
    };
  }

  async getTranscript(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        studentId,
        status: EnrollmentStatus.COMPLETED,
      },
      include: {
        courseOffering: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        courseOffering: {
          semester: "asc",
        },
      },
    });

    const semesterMap: Record<string, any> = {};

    // Separate tracking for main, concentration, and minor
    let mainGradePoints = 0;
    let mainCreditsAttempted = 0;
    let mainCreditsEarned = 0;
    
    let concentrationGradePoints = 0;
    let concentrationCreditsAttempted = 0;
    let concentrationCreditsEarned = 0;
    
    let minorGradePoints = 0;
    let minorCreditsAttempted = 0;
    let minorCreditsEarned = 0;

    for (const e of enrollments) {
      const semester = e.courseOffering.semester;
      const course = e.courseOffering.course;
      const grade = e.grade as string;

      const gradePoints = GRADE_POINTS[grade] ?? 0;
      const credits = course.credits;

      if (!semesterMap[semester]) {
        semesterMap[semester] = {
          semester,
          courses: [],
          mainTotalGradePoints: 0,
          mainTotalCredits: 0,
          mainCreditsEarned: 0,
          concentrationTotalGradePoints: 0,
          concentrationTotalCredits: 0,
          concentrationCreditsEarned: 0,
          minorTotalGradePoints: 0,
          minorTotalCredits: 0,
          minorCreditsEarned: 0,
        };
      }

      semesterMap[semester].courses.push({
        courseCode: course.code,
        courseName: course.name,
        credits,
        grade,
        gradePoints,
        enrollmentType: e.enrollmentType,
      });

      // Separate by enrollment type and exclude audit
      if (e.enrollmentType === 'CREDIT') {
        semesterMap[semester].mainTotalGradePoints += gradePoints * credits;
        semesterMap[semester].mainTotalCredits += credits;
        mainGradePoints += gradePoints * credits;
        mainCreditsAttempted += credits;
        
        if (gradePoints > 0) {
          semesterMap[semester].mainCreditsEarned += credits;
          mainCreditsEarned += credits;
        }
      } else if (e.enrollmentType === 'CREDIT_CONCENTRATION') {
        semesterMap[semester].concentrationTotalGradePoints += gradePoints * credits;
        semesterMap[semester].concentrationTotalCredits += credits;
        concentrationGradePoints += gradePoints * credits;
        concentrationCreditsAttempted += credits;
        
        if (gradePoints > 0) {
          semesterMap[semester].concentrationCreditsEarned += credits;
          concentrationCreditsEarned += credits;
        }
      } else if (e.enrollmentType === 'CREDIT_MINOR') {
        semesterMap[semester].minorTotalGradePoints += gradePoints * credits;
        semesterMap[semester].minorTotalCredits += credits;
        minorGradePoints += gradePoints * credits;
        minorCreditsAttempted += credits;
        
        if (gradePoints > 0) {
          semesterMap[semester].minorCreditsEarned += credits;
          minorCreditsEarned += credits;
        }
      }
    }

    const semesters = Object.values(semesterMap).map(
      (s: any) => ({
        semester: s.semester,
        courses: s.courses,
        main: {
          semesterCreditsEarned: s.mainCreditsEarned,
          semesterGPA:
            s.mainTotalCredits > 0
              ? (
                  s.mainTotalGradePoints / s.mainTotalCredits
                ).toFixed(2)
              : "0.00",
        },
        concentration: {
          semesterCreditsEarned: s.concentrationCreditsEarned,
          semesterGPA:
            s.concentrationTotalCredits > 0
              ? (
                  s.concentrationTotalGradePoints / s.concentrationTotalCredits
                ).toFixed(2)
              : "0.00",
        },
        minor: {
          semesterCreditsEarned: s.minorCreditsEarned,
          semesterGPA:
            s.minorTotalCredits > 0
              ? (
                  s.minorTotalGradePoints / s.minorTotalCredits
                ).toFixed(2)
              : "0.00",
        },
      }),
    );

    const mainCGPA =
      mainCreditsAttempted > 0
        ? (mainGradePoints / mainCreditsAttempted).toFixed(2)
        : "0.00";
    
    const concentrationCGPA =
      concentrationCreditsAttempted > 0
        ? (concentrationGradePoints / concentrationCreditsAttempted).toFixed(2)
        : "0.00";
    
    const minorCGPA =
      minorCreditsAttempted > 0
        ? (minorGradePoints / minorCreditsAttempted).toFixed(2)
        : "0.00";

    return {
      semesters,
      cumulative: {
        main: {
          totalCreditsEarned: mainCreditsEarned,
          CGPA: mainCGPA,
        },
        concentration: {
          totalCreditsEarned: concentrationCreditsEarned,
          CGPA: concentrationCGPA,
        },
        minor: {
          totalCreditsEarned: minorCreditsEarned,
          CGPA: minorCGPA,
        },
      },
    };
  }

}
