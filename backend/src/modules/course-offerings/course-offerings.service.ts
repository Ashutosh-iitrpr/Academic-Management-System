import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RequestOfferingDto } from "./dto/request-offering.dto";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { CourseOfferingStatus, EnrollmentStatus } from "@prisma/client";

@Injectable()
export class CourseOfferingsService {
  constructor(private prisma: PrismaService) {}

  async getForStudent(courseCode?: string) {
    return this.prisma.courseOffering.findMany({
      where: {
        status: {
          in: [
            CourseOfferingStatus.ENROLLING,
            CourseOfferingStatus.COMPLETED,
          ],
        },
        ...(courseCode && {
          course: {
            code: {
              contains: courseCode,
              mode: "insensitive",
            },
          },
        }),
      },
      include: {
        course: true,
        instructor: { select: { name: true } },
      },
    });
  }

  async getForInstructor(instructorId: string) {
    return this.prisma.courseOffering.findMany({
      where: { instructorId },
      include: {
        course: {
          select: {
            code: true,
            name: true,
            credits: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllOfferings() {
    return this.prisma.courseOffering.findMany({
      where: {
        status: {
          in: [
            CourseOfferingStatus.PENDING,
            CourseOfferingStatus.ENROLLING,
            CourseOfferingStatus.COMPLETED,
          ],
        },
      },
      include: {
        course: {
          select: {
            code: true,
            name: true,
            credits: true,
          },
        },
        instructor: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: [
        { semester: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  async getInstructorSemesters() {
    const calendars = await this.prisma.academicCalendar.findMany({
      select: { semesterName: true },
      orderBy: { createdAt: "desc" },
    });
    // Return unique semester names in order
    const seen = new Set<string>();
    const semesters: string[] = [];
    for (const c of calendars) {
      if (!seen.has(c.semesterName)) {
        seen.add(c.semesterName);
        semesters.push(c.semesterName);
      }
    }
    return semesters;
  }

  // ✅ THIS METHOD MUST EXIST
  async requestOffering(
    instructorId: string,
    dto: RequestOfferingDto,
  ) {
    // Defensive validation in case global ValidationPipe is not enabled
    if (!dto.courseCode?.trim() && !dto.courseId?.trim()) {
      throw new BadRequestException("courseCode is required");
    }
    if (!dto.semester?.trim()) {
      throw new BadRequestException("semester is required");
    }
    if (!dto.timeSlot?.trim()) {
      throw new BadRequestException("timeSlot is required");
    }
    if (!dto.allowedBranches || dto.allowedBranches.length === 0) {
      throw new BadRequestException("allowedBranches must have at least one branch");
    }

    // Ensure branches follow expected format (three uppercase letters)
    dto.allowedBranches.forEach((b) => {
      if (!/^[A-Z]{3}$/.test(b)) {
        throw new BadRequestException("Each branch code must be three uppercase letters (e.g., CSB)");
      }
    });

    // Verify instructor exists and is active
    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId },
      select: { id: true, role: true, isActive: true },
    });
    if (!instructor || instructor.role !== "INSTRUCTOR" || !instructor.isActive) {
      throw new ForbiddenException("Only active instructors can request offerings");
    }

    // Verify course exists via code (preferred) or id
    let course: { id: string; code: string; name: string; credits: number } | null = null;
    const courseCode = dto.courseCode?.trim();
    const courseId = dto.courseId?.trim();
    
    if (courseCode) {
      course = await this.prisma.course.findFirst({
        where: { code: { equals: courseCode, mode: "insensitive" } },
      });
    }
    if (!course && courseId) {
      course = await this.prisma.course.findUnique({ where: { id: courseId } });
    }
    if (!course) {
      throw new NotFoundException("Course not found. Please create a new course proposal first.");
    }

    // Prevent duplicate requests by the same instructor for the same course and semester
    const existing = await this.prisma.courseOffering.findFirst({
      where: {
        instructorId,
        courseId: course.id,
        semester: dto.semester,
        status: {
          in: [
            CourseOfferingStatus.PENDING,
            CourseOfferingStatus.ENROLLING,
            CourseOfferingStatus.COMPLETED,
          ],
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        "You already have an offering request for this course and semester",
      );
    }

    // Prevent new requests when an approved/enrolling offering already exists for this course and semester
    const approvedInSemester = await this.prisma.courseOffering.findFirst({
      where: {
        courseId: course.id,
        semester: dto.semester,
        status: CourseOfferingStatus.ENROLLING,
      },
    });

    if (approvedInSemester) {
      throw new ConflictException(
        "An approved offering already exists for this course and semester",
      );
    }

    return this.prisma.courseOffering.create({
      data: {
        instructorId,
        courseId: course.id,
        semester: dto.semester,
        timeSlot: dto.timeSlot,
        allowedBranches: dto.allowedBranches,
        status: CourseOfferingStatus.PENDING,
      },
    });
  }

  async getPendingOfferings() {
    return this.prisma.courseOffering.findMany({
        where: { status: "PENDING" },
        include: {
        course: true,
        instructor: { select: { id: true, name: true, email: true } },
        enrollments: true,
        },
        orderBy: { createdAt: "asc" },
    });
    }

    async approveOffering(offeringId: string) {
    const offering = await this.prisma.courseOffering.findUnique({
        where: { id: offeringId },
    });

    if (!offering) {
        throw new Error("Offering not found");
    }

    // Reject all other pending requests for same course + semester
    await this.prisma.courseOffering.updateMany({
        where: {
        courseId: offering.courseId,
        semester: offering.semester,
        status: "PENDING",
        id: { not: offeringId },
        },
        data: { status: "REJECTED" },
    });

    // Approve this one
    return this.prisma.courseOffering.update({
      where: { id: offeringId },
      data: {
        status: "ENROLLING",
        approvedAt: new Date(),
      },
    });
    }

    async rejectOffering(offeringId: string) {
    return this.prisma.courseOffering.update({
        where: { id: offeringId },
        data: { status: "REJECTED" },
    });
    }

    async withdrawOffering(offeringId: string) {
    return this.prisma.courseOffering.update({
        where: { id: offeringId },
        data: { status: "WITHDRAWN" },
    });
    }


  async finalizeOffering(
    instructorId: string,
    courseOfferingId: string,
  ) {
    // 1️⃣ Fetch offering
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
    });

    if (!offering) {
      throw new NotFoundException("Course offering not found");
    }

    // 2️⃣ Ownership check
    if (offering.instructorId !== instructorId) {
      throw new ForbiddenException(
        "You are not allowed to finalize this offering",
      );
    }

    // 3️⃣ Already completed?
    if (offering.status === CourseOfferingStatus.COMPLETED) {
      throw new BadRequestException(
        "Course offering already finalized",
      );
    }

    // 4️⃣ Check for ungraded enrollments
    const pendingCount = await this.prisma.enrollment.count({
      where: {
        courseOfferingId,
        status: {
          in: [
            EnrollmentStatus.ENROLLED,
            EnrollmentStatus.PENDING_INSTRUCTOR,
          ],
        },
      },
    });

    if (pendingCount > 0) {
      throw new BadRequestException(
        "Cannot finalize: some enrollments are still pending or ungraded",
      );
    }

    // 5️⃣ Finalize offering
    return this.prisma.courseOffering.update({
      where: { id: courseOfferingId },
      data: {
        status: CourseOfferingStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

}
