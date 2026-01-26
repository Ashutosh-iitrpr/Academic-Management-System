"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseOfferingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const common_2 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let CourseOfferingsService = class CourseOfferingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getForStudent(courseCode) {
        return this.prisma.courseOffering.findMany({
            where: {
                status: {
                    in: [
                        client_1.CourseOfferingStatus.ENROLLING,
                        client_1.CourseOfferingStatus.COMPLETED,
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
    async getForInstructor(instructorId) {
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
                        client_1.CourseOfferingStatus.PENDING,
                        client_1.CourseOfferingStatus.ENROLLING,
                        client_1.CourseOfferingStatus.COMPLETED,
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
        const seen = new Set();
        const semesters = [];
        for (const c of calendars) {
            if (!seen.has(c.semesterName)) {
                seen.add(c.semesterName);
                semesters.push(c.semesterName);
            }
        }
        return semesters;
    }
    async requestOffering(instructorId, dto) {
        if (!dto.courseCode?.trim() && !dto.courseId?.trim()) {
            throw new common_2.BadRequestException("courseCode is required");
        }
        if (!dto.semester?.trim()) {
            throw new common_2.BadRequestException("semester is required");
        }
        if (!dto.timeSlot?.trim()) {
            throw new common_2.BadRequestException("timeSlot is required");
        }
        if (!dto.allowedBranches || dto.allowedBranches.length === 0) {
            throw new common_2.BadRequestException("allowedBranches must have at least one branch");
        }
        dto.allowedBranches.forEach((b) => {
            if (!/^[A-Z]{3}$/.test(b)) {
                throw new common_2.BadRequestException("Each branch code must be three uppercase letters (e.g., CSB)");
            }
        });
        const instructor = await this.prisma.user.findUnique({
            where: { id: instructorId },
            select: { id: true, role: true, isActive: true },
        });
        if (!instructor || instructor.role !== "INSTRUCTOR" || !instructor.isActive) {
            throw new common_2.ForbiddenException("Only active instructors can request offerings");
        }
        let course = null;
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
            throw new common_2.NotFoundException("Course not found. Please create a new course proposal first.");
        }
        const existing = await this.prisma.courseOffering.findFirst({
            where: {
                instructorId,
                courseId: course.id,
                semester: dto.semester,
                status: {
                    in: [
                        client_1.CourseOfferingStatus.PENDING,
                        client_1.CourseOfferingStatus.ENROLLING,
                        client_1.CourseOfferingStatus.COMPLETED,
                    ],
                },
            },
        });
        if (existing) {
            throw new common_2.ConflictException("You already have an offering request for this course and semester");
        }
        const approvedInSemester = await this.prisma.courseOffering.findFirst({
            where: {
                courseId: course.id,
                semester: dto.semester,
                status: client_1.CourseOfferingStatus.ENROLLING,
            },
        });
        if (approvedInSemester) {
            throw new common_2.ConflictException("An approved offering already exists for this course and semester");
        }
        return this.prisma.courseOffering.create({
            data: {
                instructorId,
                courseId: course.id,
                semester: dto.semester,
                timeSlot: dto.timeSlot,
                allowedBranches: dto.allowedBranches,
                status: client_1.CourseOfferingStatus.PENDING,
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
    async approveOffering(offeringId) {
        const offering = await this.prisma.courseOffering.findUnique({
            where: { id: offeringId },
        });
        if (!offering) {
            throw new Error("Offering not found");
        }
        await this.prisma.courseOffering.updateMany({
            where: {
                courseId: offering.courseId,
                semester: offering.semester,
                status: "PENDING",
                id: { not: offeringId },
            },
            data: { status: "REJECTED" },
        });
        return this.prisma.courseOffering.update({
            where: { id: offeringId },
            data: {
                status: "ENROLLING",
                approvedAt: new Date(),
            },
        });
    }
    async rejectOffering(offeringId) {
        return this.prisma.courseOffering.update({
            where: { id: offeringId },
            data: { status: "REJECTED" },
        });
    }
    async withdrawOffering(offeringId) {
        return this.prisma.courseOffering.update({
            where: { id: offeringId },
            data: { status: "WITHDRAWN" },
        });
    }
    async finalizeOffering(instructorId, courseOfferingId) {
        const offering = await this.prisma.courseOffering.findUnique({
            where: { id: courseOfferingId },
        });
        if (!offering) {
            throw new common_2.NotFoundException("Course offering not found");
        }
        if (offering.instructorId !== instructorId) {
            throw new common_2.ForbiddenException("You are not allowed to finalize this offering");
        }
        if (offering.status === client_1.CourseOfferingStatus.COMPLETED) {
            throw new common_2.BadRequestException("Course offering already finalized");
        }
        const pendingCount = await this.prisma.enrollment.count({
            where: {
                courseOfferingId,
                status: {
                    in: [
                        client_1.EnrollmentStatus.ENROLLED,
                        client_1.EnrollmentStatus.PENDING_INSTRUCTOR,
                    ],
                },
            },
        });
        if (pendingCount > 0) {
            throw new common_2.BadRequestException("Cannot finalize: some enrollments are still pending or ungraded");
        }
        return this.prisma.courseOffering.update({
            where: { id: courseOfferingId },
            data: {
                status: client_1.CourseOfferingStatus.COMPLETED,
                completedAt: new Date(),
            },
        });
    }
};
exports.CourseOfferingsService = CourseOfferingsService;
exports.CourseOfferingsService = CourseOfferingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CourseOfferingsService);
//# sourceMappingURL=course-offerings.service.js.map