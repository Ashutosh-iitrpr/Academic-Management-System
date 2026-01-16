import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { EnrollmentStatus } from "@prisma/client";
import { GRADE_POINTS } from "src/constants/grades.constants";

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
  constructor(private prisma: PrismaService) {}

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

    for (const e of enrollments) {
      const semester = e.courseOffering.semester;
      const course = e.courseOffering.course;

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
      }

      if (
        e.status === EnrollmentStatus.ENROLLED ||
        e.status === EnrollmentStatus.AUDIT
      ) {
        semesterWiseEnrollments[semester].ongoing.push(courseSummary);
        semesterWiseEnrollments[semester].creditsRegistered += course.credits;
        creditsOngoing += course.credits;
      }

      if (e.status === EnrollmentStatus.DROPPED) {
        semesterWiseEnrollments[semester].dropped.push(courseSummary);
      }
    }

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

    let totalGradePoints = 0;
    let totalCreditsAttempted = 0;
    let totalCreditsEarned = 0;

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
          totalGradePoints: 0,
          totalCredits: 0,
          creditsEarned: 0,
        };
      }

      semesterMap[semester].courses.push({
        courseCode: course.code,
        courseName: course.name,
        credits,
        grade,
        gradePoints,
      });

      semesterMap[semester].totalGradePoints +=
        gradePoints * credits;
      semesterMap[semester].totalCredits += credits;

      totalGradePoints += gradePoints * credits;
      totalCreditsAttempted += credits;

      if (gradePoints > 0) {
        semesterMap[semester].creditsEarned += credits;
        totalCreditsEarned += credits;
      }
    }

    const semesters = Object.values(semesterMap).map(
      (s: any) => ({
        semester: s.semester,
        courses: s.courses,
        semesterCreditsEarned: s.creditsEarned,
        semesterGPA:
          s.totalCredits > 0
            ? (
                s.totalGradePoints / s.totalCredits
              ).toFixed(2)
            : "0.00",
      }),
    );

    const CGPA =
      totalCreditsAttempted > 0
        ? (totalGradePoints / totalCreditsAttempted).toFixed(2)
        : "0.00";

    return {
      semesters,
      cumulative: {
        totalCreditsEarned,
        CGPA,
      },
    };
  }

}
