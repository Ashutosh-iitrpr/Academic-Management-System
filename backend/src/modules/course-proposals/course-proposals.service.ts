import { Injectable, BadRequestException, ConflictException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCourseProposalDto } from "./dto/create-course-proposal.dto";

@Injectable()
export class CourseProposalsService {
  constructor(private prisma: PrismaService) {}

  async createProposal(instructorId: string, dto: CreateCourseProposalDto) {
    // Verify instructor exists and is active
    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId },
      select: { id: true, role: true, isActive: true },
    });
    if (!instructor || instructor.role !== "INSTRUCTOR" || !instructor.isActive) {
      throw new ForbiddenException("Only active instructors can propose new courses");
    }

    // Check if course code already exists
    const existingCourse = await this.prisma.course.findFirst({
      where: { code: { equals: dto.code.trim(), mode: "insensitive" } },
    });
    if (existingCourse) {
      throw new ConflictException("Course code already exists");
    }

    // Check if there's already a pending proposal with this code
    const existingProposal = await this.prisma.courseProposal.findFirst({
      where: {
        code: { equals: dto.code.trim(), mode: "insensitive" },
        status: "PENDING",
      },
    });
    if (existingProposal) {
      throw new ConflictException("A pending proposal with this course code already exists");
    }

    return this.prisma.courseProposal.create({
      data: {
        instructorId,
        code: dto.code.trim(),
        name: dto.name.trim(),
        credits: dto.credits,
        ltpsc: dto.ltpsc.trim(),
        description: dto.description?.trim() || null,
        status: "PENDING",
      },
    });
  }

  async getInstructorProposals(instructorId: string) {
    return this.prisma.courseProposal.findMany({
      where: { instructorId },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllPendingProposals() {
    return this.prisma.courseProposal.findMany({
      where: { status: "PENDING" },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async approveProposal(proposalId: string) {
    const proposal = await this.prisma.courseProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException("Proposal not found");
    }

    if (proposal.status !== "PENDING") {
      throw new BadRequestException("Proposal is not pending");
    }

    // Check if course code exists now (in case it was created meanwhile)
    const existingCourse = await this.prisma.course.findFirst({
      where: { code: { equals: proposal.code, mode: "insensitive" } },
    });

    if (existingCourse) {
      // Update existing course with ltpsc if not set
      if (!existingCourse.ltpsc && proposal.ltpsc) {
        await this.prisma.course.update({
          where: { id: existingCourse.id },
          data: { ltpsc: proposal.ltpsc },
        });
      }
      // Just mark as approved and link to existing course
      return this.prisma.courseProposal.update({
        where: { id: proposalId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          courseId: existingCourse.id,
        },
        include: {
          course: true,
        },
      });
    }

    // Create the course and link it
    const newCourse = await this.prisma.course.create({
      data: {
        code: proposal.code,
        name: proposal.name,
        credits: proposal.credits,
        ltpsc: proposal.ltpsc,
        description: proposal.description,
      },
    });

    return this.prisma.courseProposal.update({
      where: { id: proposalId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        courseId: newCourse.id,
      },
      include: {
        course: true,
      },
    });
  }

  async rejectProposal(proposalId: string) {
    const proposal = await this.prisma.courseProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException("Proposal not found");
    }

    if (proposal.status !== "PENDING") {
      throw new BadRequestException("Proposal is not pending");
    }

    return this.prisma.courseProposal.update({
      where: { id: proposalId },
      data: {
        status: "REJECTED",
      },
    });
  }
}
