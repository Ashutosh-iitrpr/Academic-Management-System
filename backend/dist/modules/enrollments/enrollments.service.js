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
exports.EnrollmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const academics_constants_1 = require("../../constants/academics.constants");
const academic_calendar_service_1 = require("../../common/services/academic-calendar.service");
let EnrollmentsService = class EnrollmentsService {
    prisma;
    academicCalendarService;
    constructor(prisma, academicCalendarService) {
        this.prisma = prisma;
        this.academicCalendarService = academicCalendarService;
    }
    async requestEnrollment(studentId, dto) {
        await this.academicCalendarService.assertEnrollmentOpen();
        const offering = await this.prisma.courseOffering.findUnique({
            where: { id: dto.courseOfferingId },
            include: {
                course: true,
            },
        });
        if (!offering) {
            throw new common_1.BadRequestException("Course offering not found");
        }
        if (offering.status !== client_1.CourseOfferingStatus.ENROLLING) {
            throw new common_1.BadRequestException("Course is not open for enrollment");
        }
        const student = await this.prisma.user.findUnique({
            where: { id: studentId },
        });
        if (!student?.entryNumber) {
            throw new common_1.BadRequestException("Invalid student");
        }
        const branch = student.entryNumber.substring(4, 7);
        if (!offering.allowedBranches.includes(branch)) {
            throw new common_1.BadRequestException("Course not offered to your branch");
        }
        const existing = await this.prisma.enrollment.findFirst({
            where: {
                studentId,
                courseOfferingId: dto.courseOfferingId,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException("Enrollment already exists");
        }
        const activeEnrollments = await this.prisma.enrollment.findMany({
            where: {
                studentId,
                status: client_1.EnrollmentStatus.ENROLLED,
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
        const currentCredits = activeEnrollments.reduce((sum, e) => sum + e.courseOffering.course.credits, 0);
        if (currentCredits + offering.course.credits >
            academics_constants_1.MAX_CREDITS_PER_SEMESTER) {
            throw new common_1.BadRequestException(`Credit limit exceeded. Current: ${currentCredits}, ` +
                `Course: ${offering.course.credits}, ` +
                `Max allowed: ${academics_constants_1.MAX_CREDITS_PER_SEMESTER}`);
        }
        return this.prisma.enrollment.create({
            data: {
                studentId,
                courseOfferingId: dto.courseOfferingId,
                enrollmentType: dto.enrollmentType,
                status: client_1.EnrollmentStatus.PENDING_INSTRUCTOR,
                source: client_1.EnrollmentSource.STUDENT_REQUEST,
            },
        });
    }
    async getPendingForInstructor(instructorId) {
        return this.prisma.enrollment.findMany({
            where: {
                status: client_1.EnrollmentStatus.PENDING_INSTRUCTOR,
                courseOffering: { instructorId },
            },
            include: {
                student: { select: { name: true, entryNumber: true } },
                courseOffering: { include: { course: true } },
            },
            orderBy: { createdAt: "asc" },
        });
    }
    async approveEnrollment(instructorId, enrollmentId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: { courseOffering: true },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException("Enrollment not found");
        }
        if (enrollment.courseOffering.instructorId !== instructorId) {
            throw new common_1.ForbiddenException("You are not allowed to approve this enrollment");
        }
        if (enrollment.status !== client_1.EnrollmentStatus.PENDING_INSTRUCTOR) {
            throw new common_1.ForbiddenException("Enrollment is not pending approval");
        }
        return this.prisma.enrollment.update({
            where: { id: enrollmentId },
            data: {
                status: client_1.EnrollmentStatus.ENROLLED,
                approvedAt: new Date(),
            },
        });
    }
    async rejectEnrollment(instructorId, enrollmentId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: { courseOffering: true },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException("Enrollment not found");
        }
        if (enrollment.courseOffering.instructorId !== instructorId) {
            throw new common_1.ForbiddenException("You are not allowed to reject this enrollment");
        }
        if (enrollment.status !== client_1.EnrollmentStatus.PENDING_INSTRUCTOR) {
            throw new common_1.ForbiddenException("Enrollment is not pending approval");
        }
        return this.prisma.enrollment.update({
            where: { id: enrollmentId },
            data: { status: client_1.EnrollmentStatus.REJECTED },
        });
    }
    async dropEnrollment(studentId, enrollmentId) {
        await this.academicCalendarService.assertDropAllowed();
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException("Enrollment not found");
        }
        if (enrollment.studentId !== studentId) {
            throw new common_1.ForbiddenException("You cannot modify this enrollment");
        }
        if (enrollment.source === client_1.EnrollmentSource.INSTRUCTOR_ASSIGNED) {
            throw new common_1.ForbiddenException("Core courses cannot be dropped");
        }
        if (enrollment.status !== client_1.EnrollmentStatus.ENROLLED) {
            throw new common_1.ForbiddenException("Only enrolled courses can be dropped");
        }
        return this.prisma.enrollment.update({
            where: { id: enrollmentId },
            data: { status: client_1.EnrollmentStatus.DROPPED },
        });
    }
    async auditEnrollment(studentId, enrollmentId) {
        await this.academicCalendarService.assertAuditAllowed();
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException("Enrollment not found");
        }
        if (enrollment.studentId !== studentId) {
            throw new common_1.ForbiddenException("You cannot modify this enrollment");
        }
        if (enrollment.source === client_1.EnrollmentSource.INSTRUCTOR_ASSIGNED) {
            throw new common_1.ForbiddenException("Core courses cannot be audited");
        }
        if (enrollment.status !== client_1.EnrollmentStatus.ENROLLED) {
            throw new common_1.ForbiddenException("Only enrolled courses can be audited");
        }
        return this.prisma.enrollment.update({
            where: { id: enrollmentId },
            data: { status: client_1.EnrollmentStatus.AUDIT },
        });
    }
    async createEnrollmentTrigger(instructorId, dto) {
        const offering = await this.prisma.courseOffering.findUnique({
            where: { id: dto.courseOfferingId },
        });
        if (!offering) {
            throw new common_1.BadRequestException("Course offering not found");
        }
        if (offering.instructorId !== instructorId) {
            throw new common_1.ForbiddenException("You do not own this course offering");
        }
        if (offering.status !== client_1.CourseOfferingStatus.ENROLLING) {
            throw new common_1.BadRequestException("Course is not open for enrollment");
        }
        if (!offering.allowedBranches.includes(dto.branchCode)) {
            throw new common_1.BadRequestException("Branch not allowed for this course");
        }
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
                        status: client_1.EnrollmentStatus.ENROLLED,
                        source: client_1.EnrollmentSource.INSTRUCTOR_ASSIGNED,
                    },
                });
                enrolledCount++;
            }
            else if (enrollment.status === client_1.EnrollmentStatus.DROPPED) {
                await this.prisma.enrollment.update({
                    where: { id: enrollment.id },
                    data: {
                        status: client_1.EnrollmentStatus.ENROLLED,
                        source: client_1.EnrollmentSource.INSTRUCTOR_ASSIGNED,
                        enrollmentType: dto.enrollmentType,
                        approvedAt: new Date(),
                    },
                });
                enrolledCount++;
            }
        }
        return { trigger, enrolledCount };
    }
    async getUnifiedEnrollmentList(viewer, courseOfferingId) {
        const offering = await this.prisma.courseOffering.findUnique({
            where: { id: courseOfferingId },
        });
        if (!offering) {
            throw new common_1.NotFoundException("Course offering not found");
        }
        const enrollments = await this.prisma.enrollment.findMany({
            where: { courseOfferingId },
            include: {
                student: { select: { name: true, entryNumber: true } },
            },
            orderBy: [{ status: "asc" }, { createdAt: "asc" }],
        });
        const isOwnerInstructor = viewer.role === "INSTRUCTOR" &&
            offering.instructorId === viewer.userId;
        const grouped = {
            pending: enrollments.filter((e) => e.status === client_1.EnrollmentStatus.PENDING_INSTRUCTOR),
            enrolled: enrollments.filter((e) => e.status === client_1.EnrollmentStatus.ENROLLED),
            audit: enrollments.filter((e) => e.status === client_1.EnrollmentStatus.AUDIT),
            dropped: enrollments.filter((e) => e.status === client_1.EnrollmentStatus.DROPPED),
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
    async uploadGrades(instructorId, courseOfferingId, grades) {
        const offering = await this.prisma.courseOffering.findUnique({
            where: { id: courseOfferingId },
        });
        if (offering?.status === client_1.CourseOfferingStatus.COMPLETED) {
            throw new common_1.BadRequestException("Grades are finalized. Further changes are not allowed.");
        }
        if (!offering) {
            throw new common_1.NotFoundException("Course offering not found");
        }
        if (offering.instructorId !== instructorId) {
            throw new common_1.ForbiddenException("You do not own this course offering");
        }
        const results = [];
        for (const item of grades) {
            const enrollment = await this.prisma.enrollment.findUnique({
                where: { id: item.enrollmentId },
            });
            if (!enrollment)
                continue;
            if (enrollment.courseOfferingId !== courseOfferingId) {
                throw new common_1.BadRequestException(`Enrollment ${enrollment.id} does not belong to this course offering`);
            }
            if (enrollment.status !== client_1.EnrollmentStatus.ENROLLED)
                continue;
            if (enrollment.grade)
                continue;
            const updated = await this.prisma.enrollment.update({
                where: { id: enrollment.id },
                data: {
                    grade: item.grade,
                    status: client_1.EnrollmentStatus.COMPLETED,
                    completedAt: new Date(),
                },
            });
            results.push(updated.id);
        }
        return {
            updatedCount: results.length,
            updatedEnrollments: results,
        };
    }
};
exports.EnrollmentsService = EnrollmentsService;
exports.EnrollmentsService = EnrollmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        academic_calendar_service_1.AcademicCalendarService])
], EnrollmentsService);
//# sourceMappingURL=enrollments.service.js.map