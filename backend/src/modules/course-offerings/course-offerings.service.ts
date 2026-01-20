import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RequestOfferingDto } from "./dto/request-offering.dto";
import {
  BadRequestException,
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

  // ✅ THIS METHOD MUST EXIST
  async requestOffering(
    instructorId: string,
    dto: RequestOfferingDto,
  ) {
    return this.prisma.courseOffering.create({
      data: {
        instructorId,
        courseId: dto.courseId,
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
        instructor: { select: { name: true, email: true } },
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
