import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  EnrollmentStatus,
  CourseOfferingStatus,
  EnrollmentSource,
  Grade,
} from "@prisma/client";
import { RequestEnrollmentDto } from "./dto/request-enrollment.dto";
import { CreateEnrollmentTriggerDto } from "./dto/create-enrollment-trigger.dto";
import { MAX_CREDITS_PER_SEMESTER } from "../../constants/academics.constants";
import { AcademicCalendarService } from "src/common/services/academic-calendar.service";

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService,
    private academicCalendarService: AcademicCalendarService,
  ) {}

  // ================= STUDENT REQUEST =================

async requestEnrollment(
  studentId: string,
  dto: RequestEnrollmentDto,
) {
  await this.academicCalendarService.assertEnrollmentOpen();

  // 1️⃣ Fetch course offering (with course credits)
  const offering = await this.prisma.courseOffering.findUnique({
    where: { id: dto.courseOfferingId },
    include: {
      course: true, // needed for credits
    },
  });

  if (!offering) {
    throw new BadRequestException("Course offering not found");
  }

  if (offering.status !== CourseOfferingStatus.ENROLLING) {
    throw new BadRequestException(
      "Course is not open for enrollment",
    );
  }

  // 2️⃣ Fetch student
  const student = await this.prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student?.entryNumber) {
    throw new BadRequestException("Invalid student");
  }

  // 3️⃣ Branch eligibility check
  const branch = student.entryNumber.substring(4, 7);

  if (!offering.allowedBranches.includes(branch)) {
    throw new BadRequestException(
      "Course not offered to your branch",
    );
  }

  // 4️⃣ Prevent duplicate enrollment
  const existing = await this.prisma.enrollment.findFirst({
    where: {
      studentId,
      courseOfferingId: dto.courseOfferingId,
    },
  });

  if (existing) {
    throw new BadRequestException(
      "Enrollment already exists",
    );
  }

  // 5️⃣ CREDIT LIMIT CHECK (per semester)
  const activeEnrollments = await this.prisma.enrollment.findMany({
    where: {
      studentId,
      status: EnrollmentStatus.ENROLLED,
      courseOffering: {
        semester: offering.semester,
      },
    },
    include: {
      courseOffering: {
        include: {
          course: true,
        },
      },
    },
  });

  const currentCredits = activeEnrollments.reduce(
    (sum, e) => sum + e.courseOffering.course.credits,
    0,
  );

  if (
    currentCredits + offering.course.credits >
    MAX_CREDITS_PER_SEMESTER
  ) {
    throw new BadRequestException(
      `Credit limit exceeded. Current: ${currentCredits}, ` +
      `Course: ${offering.course.credits}, ` +
      `Max allowed: ${MAX_CREDITS_PER_SEMESTER}`,
    );
  }

  // 6️⃣ Create enrollment request
  return this.prisma.enrollment.create({
    data: {
      studentId,
      courseOfferingId: dto.courseOfferingId,
      enrollmentType: dto.enrollmentType,
      status: EnrollmentStatus.PENDING_INSTRUCTOR,
      source: EnrollmentSource.STUDENT_REQUEST,
    },
  });
}

  // ================= INSTRUCTOR APPROVAL =================

  async getPendingForInstructor(instructorId: string) {
    return this.prisma.enrollment.findMany({
      where: {
        status: EnrollmentStatus.PENDING_INSTRUCTOR,
        courseOffering: { instructorId },
      },
      include: {
        student: { select: { name: true, entryNumber: true } },
        courseOffering: { include: { course: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async approveEnrollment(
    instructorId: string,
    enrollmentId: string,
  ) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { courseOffering: true },
    });

    if (!enrollment) {
      throw new NotFoundException("Enrollment not found");
    }

    if (enrollment.courseOffering.instructorId !== instructorId) {
      throw new ForbiddenException(
        "You are not allowed to approve this enrollment",
      );
    }

    if (enrollment.status !== EnrollmentStatus.PENDING_INSTRUCTOR) {
      throw new ForbiddenException(
        "Enrollment is not pending approval",
      );
    }

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: EnrollmentStatus.ENROLLED,
        approvedAt: new Date(),
      },
    });
  }

  async rejectEnrollment(
    instructorId: string,
    enrollmentId: string,
  ) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { courseOffering: true },
    });

    if (!enrollment) {
      throw new NotFoundException("Enrollment not found");
    }

    if (enrollment.courseOffering.instructorId !== instructorId) {
      throw new ForbiddenException(
        "You are not allowed to reject this enrollment",
      );
    }

    if (enrollment.status !== EnrollmentStatus.PENDING_INSTRUCTOR) {
      throw new ForbiddenException(
        "Enrollment is not pending approval",
      );
    }

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: EnrollmentStatus.REJECTED },
    });
  }

  // ================= STUDENT DROP / AUDIT =================

  async dropEnrollment(studentId: string, enrollmentId: string) {
    await this.academicCalendarService.assertDropAllowed();

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException("Enrollment not found");
    }

    if (enrollment.studentId !== studentId) {
      throw new ForbiddenException(
        "You cannot modify this enrollment",
      );
    }

    if (enrollment.source === EnrollmentSource.INSTRUCTOR_ASSIGNED) {
      throw new ForbiddenException(
        "Core courses cannot be dropped",
      );
    }

    if (enrollment.status !== EnrollmentStatus.ENROLLED) {
      throw new ForbiddenException(
        "Only enrolled courses can be dropped",
      );
    }

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: EnrollmentStatus.DROPPED },
    });
  }

  async auditEnrollment(studentId: string, enrollmentId: string) {
    await this.academicCalendarService.assertAuditAllowed();

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException("Enrollment not found");
    }

    if (enrollment.studentId !== studentId) {
      throw new ForbiddenException(
        "You cannot modify this enrollment",
      );
    }

    if (enrollment.source === EnrollmentSource.INSTRUCTOR_ASSIGNED) {
      throw new ForbiddenException(
        "Core courses cannot be audited",
      );
    }

    if (enrollment.status !== EnrollmentStatus.ENROLLED) {
      throw new ForbiddenException(
        "Only enrolled courses can be audited",
      );
    }

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: EnrollmentStatus.AUDIT },
    });
  }

  // ================= ENROLLMENT TRIGGER (FINAL FIX) =================

  async createEnrollmentTrigger(
    instructorId: string,
    dto: CreateEnrollmentTriggerDto,
  ) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: dto.courseOfferingId },
    });

    if (!offering) {
      throw new BadRequestException("Course offering not found");
    }

    if (offering.instructorId !== instructorId) {
      throw new ForbiddenException(
        "You do not own this course offering",
      );
    }

    if (offering.status !== CourseOfferingStatus.ENROLLING) {
      throw new BadRequestException(
        "Course is not open for enrollment",
      );
    }

    if (!offering.allowedBranches.includes(dto.branchCode)) {
      throw new BadRequestException(
        "Branch not allowed for this course",
      );
    }

    // 🔑 FIND OR CREATE TRIGGER (IDEMPOTENT)
    let trigger = await this.prisma.enrollmentTrigger.findFirst({
      where: {
        courseOfferingId: dto.courseOfferingId,
        branchCode: dto.branchCode,
        batchYear: dto.batchYear,
      },
    });

    if (!trigger) {
      trigger = await this.prisma.enrollmentTrigger.create({
        data: {
          courseOfferingId: dto.courseOfferingId,
          branchCode: dto.branchCode,
          batchYear: dto.batchYear,
          enrollmentType: dto.enrollmentType,
          instructorId,
        },
      });
    }

    // Apply trigger EVERY time
    const students = await this.prisma.user.findMany({
      where: {
        role: "STUDENT",
        entryNumber: {
          startsWith: `${dto.batchYear}${dto.branchCode}`,
        },
      },
    });

    let enrolledCount = 0;

    for (const student of students) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          studentId: student.id,
          courseOfferingId: dto.courseOfferingId,
        },
      });

      if (!enrollment) {
        await this.prisma.enrollment.create({
          data: {
            studentId: student.id,
            courseOfferingId: dto.courseOfferingId,
            enrollmentType: dto.enrollmentType,
            status: EnrollmentStatus.ENROLLED,
            source: EnrollmentSource.INSTRUCTOR_ASSIGNED,
          },
        });
        enrolledCount++;
      } else if (enrollment.status === EnrollmentStatus.DROPPED) {
        await this.prisma.enrollment.update({
          where: { id: enrollment.id },
          data: {
            status: EnrollmentStatus.ENROLLED,
            source: EnrollmentSource.INSTRUCTOR_ASSIGNED,
            enrollmentType: dto.enrollmentType,
            approvedAt: new Date(),
          },
        });
        enrolledCount++;
      }
    }

    return { trigger, enrolledCount };
  }

  // ================= UNIFIED VIEW =================

  async getUnifiedEnrollmentList(
    viewer: { userId: string; role: string },
    courseOfferingId: string,
  ) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
    });

    if (!offering) {
      throw new NotFoundException("Course offering not found");
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseOfferingId },
      include: {
        student: { select: { name: true, entryNumber: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    });

    const isOwnerInstructor =
      viewer.role === "INSTRUCTOR" &&
      offering.instructorId === viewer.userId;

    const grouped = {
      pending: enrollments.filter(
        (e) => e.status === EnrollmentStatus.PENDING_INSTRUCTOR,
      ),
      enrolled: enrollments.filter(
        (e) => e.status === EnrollmentStatus.ENROLLED,
      ),
      audit: enrollments.filter(
        (e) => e.status === EnrollmentStatus.AUDIT,
      ),
      dropped: enrollments.filter(
        (e) => e.status === EnrollmentStatus.DROPPED,
      ),
    };

    return {
      viewerRole: viewer.role,
      canEdit: isOwnerInstructor,
      canApprove: isOwnerInstructor,
      canTrigger: isOwnerInstructor,
      enrollments: grouped,
      stats: {
        pending: grouped.pending.length,
        enrolled: grouped.enrolled.length,
        audit: grouped.audit.length,
        dropped: grouped.dropped.length,
      },
    };
  }

  async uploadGrades(
    instructorId: string,
    courseOfferingId: string,
    grades: { enrollmentId: string; grade: Grade }[],
  ) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
    });

    if (offering?.status === CourseOfferingStatus.COMPLETED) {
    throw new BadRequestException(
      "Grades are finalized. Further changes are not allowed.",
    );
  }

    if (!offering) {
      throw new NotFoundException("Course offering not found");
    }

    if (offering.instructorId !== instructorId) {
      throw new ForbiddenException(
        "You do not own this course offering",
      );
    }

    const results: string[] = [];

    for (const item of grades) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { id: item.enrollmentId },
      });

      if (!enrollment) continue;
      if (enrollment.courseOfferingId !== courseOfferingId) {
        throw new BadRequestException(
          `Enrollment ${enrollment.id} does not belong to this course offering`
        );
      }
      if (enrollment.status !== EnrollmentStatus.ENROLLED) continue;
      if (enrollment.grade) continue;

      const updated = await this.prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          grade: item.grade,
          status: EnrollmentStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
//       console.log(
//   "ENROLLMENT OFFERING:",
//   enrollment.courseOfferingId,
//   "API OFFERING:",
//   courseOfferingId
// );
      results.push(updated.id);
    }

    return {
      updatedCount: results.length,
      updatedEnrollments: results,
    };
  }


}
