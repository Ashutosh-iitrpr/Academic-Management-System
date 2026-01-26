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
const branch_department_mapping_1 = require("../../constants/branch-department-mapping");
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
        if (dto.enrollmentType === 'CREDIT_CONCENTRATION' ||
            dto.enrollmentType === 'CREDIT_MINOR') {
            const oppositeType = dto.enrollmentType === 'CREDIT_CONCENTRATION'
                ? 'CREDIT_MINOR'
                : 'CREDIT_CONCENTRATION';
            const hasOpposite = await this.prisma.enrollment.findFirst({
                where: {
                    studentId,
                    enrollmentType: oppositeType,
                    status: {
                        in: [
                            client_1.EnrollmentStatus.PENDING_INSTRUCTOR,
                            client_1.EnrollmentStatus.ENROLLED,
                            client_1.EnrollmentStatus.AUDIT,
                            client_1.EnrollmentStatus.COMPLETED,
                        ],
                    },
                },
            });
            if (hasOpposite) {
                throw new common_1.BadRequestException(`Cannot request ${dto.enrollmentType.replace('CREDIT_', '').toLowerCase()}. ` +
                    `Student already has ${oppositeType.replace('CREDIT_', '').toLowerCase()} enrollments`);
            }
        }
        const activeEnrollments = await this.prisma.enrollment.findMany({
            where: {
                studentId,
                enrollmentType: 'CREDIT',
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
                student: { select: { name: true, entryNumber: true, email: true } },
                courseOffering: { include: { course: true } },
            },
            orderBy: { createdAt: "asc" },
        });
    }
    async getOfferingEnrollmentsForInstructor(instructorId, courseOfferingId) {
        const offering = await this.prisma.courseOffering.findUnique({
            where: { id: courseOfferingId },
        });
        if (!offering) {
            throw new common_1.NotFoundException("Course offering not found");
        }
        if (offering.instructorId !== instructorId) {
            throw new common_1.ForbiddenException("You do not have access to this course offering");
        }
        return this.prisma.enrollment.findMany({
            where: { courseOfferingId },
            include: {
                student: { select: { name: true, entryNumber: true, email: true } },
            },
            orderBy: [{ status: "asc" }, { createdAt: "asc" }],
        });
    }
    async approveEnrollment(instructorId, enrollmentId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                courseOffering: {
                    include: {
                        instructor: true,
                    },
                },
                student: true,
            },
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
        const instructor = await this.prisma.user.findUnique({
            where: { id: instructorId },
        });
        const facultyAdvisor = await this.prisma.user.findFirst({
            where: {
                isFacultyAdvisor: true,
                department: instructor?.department,
                role: 'INSTRUCTOR',
            },
        });
        return this.prisma.enrollment.update({
            where: { id: enrollmentId },
            data: {
                status: client_1.EnrollmentStatus.PENDING_ADVISOR,
                advisorId: facultyAdvisor?.id || null,
                approvedAt: null,
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
    async bulkActionEnrollments(instructorId, dto) {
        if (!dto.enrollmentIds || dto.enrollmentIds.length === 0) {
            throw new common_1.BadRequestException("No enrollment IDs provided");
        }
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                id: { in: dto.enrollmentIds },
            },
            include: { courseOffering: true },
        });
        if (enrollments.length === 0) {
            throw new common_1.BadRequestException("No enrollments found");
        }
        const invalidEnrollments = [];
        for (const enrollment of enrollments) {
            if (enrollment.courseOffering.instructorId !== instructorId) {
                invalidEnrollments.push({
                    id: enrollment.id,
                    reason: "Not your enrollment",
                });
            }
            if (enrollment.status !== client_1.EnrollmentStatus.PENDING_INSTRUCTOR) {
                invalidEnrollments.push({
                    id: enrollment.id,
                    reason: "Not in pending status",
                });
            }
        }
        if (invalidEnrollments.length > 0) {
            throw new common_1.ForbiddenException({
                message: "Some enrollments cannot be processed",
                invalidEnrollments,
            });
        }
        const newStatus = dto.action === "approve"
            ? client_1.EnrollmentStatus.PENDING_ADVISOR
            : client_1.EnrollmentStatus.REJECTED;
        const updateData = {
            status: newStatus,
            ...(dto.action === "approve" && { approvedAt: null, advisorId: null }),
        };
        const result = await this.prisma.enrollment.updateMany({
            where: {
                id: { in: dto.enrollmentIds },
            },
            data: updateData,
        });
        return {
            message: `${dto.action === "approve" ? "Approved" : "Rejected"} ${result.count} enrollment(s)`,
            count: result.count,
            action: dto.action,
        };
    }
    async getPendingForAdvisor(advisorId) {
        const advisor = await this.prisma.user.findUnique({
            where: { id: advisorId },
            select: { department: true },
        });
        if (!advisor?.department) {
            throw new common_1.ForbiddenException('Advisor does not have a department assigned');
        }
        const allPendingEnrollments = await this.prisma.enrollment.findMany({
            where: {
                status: client_1.EnrollmentStatus.PENDING_ADVISOR,
            },
            include: {
                student: { select: { id: true, name: true, entryNumber: true, email: true } },
                courseOffering: { include: { course: true, instructor: { select: { name: true } } } },
            },
            orderBy: { createdAt: "asc" },
        });
        const advisorDepartment = advisor.department;
        const matchingEnrollments = allPendingEnrollments.filter(enrollment => {
            const studentBranch = enrollment.student.entryNumber?.substring(4, 7);
            if (!studentBranch)
                return false;
            return (0, branch_department_mapping_1.isDepartmentBranchMatch)(advisorDepartment, studentBranch);
        });
        return matchingEnrollments;
    }
    async approveEnrollmentAsAdvisor(advisorId, enrollmentId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                courseOffering: true,
                student: { select: { entryNumber: true } },
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException("Enrollment not found");
        }
        const advisor = await this.prisma.user.findUnique({
            where: { id: advisorId },
            select: { department: true },
        });
        if (!advisor?.department) {
            throw new common_1.ForbiddenException('Advisor does not have a department assigned');
        }
        const studentBranch = enrollment.student.entryNumber?.substring(4, 7);
        if (!studentBranch || !(0, branch_department_mapping_1.isDepartmentBranchMatch)(advisor.department, studentBranch)) {
            throw new common_1.ForbiddenException("You are not allowed to approve this enrollment (department/branch mismatch)");
        }
        if (enrollment.status !== client_1.EnrollmentStatus.PENDING_ADVISOR) {
            throw new common_1.ForbiddenException("Enrollment is not pending advisor approval");
        }
        return this.prisma.enrollment.update({
            where: { id: enrollmentId },
            data: {
                status: client_1.EnrollmentStatus.ENROLLED,
                approvedAt: new Date(),
            },
        });
    }
    async rejectEnrollmentAsAdvisor(advisorId, enrollmentId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                courseOffering: true,
                student: { select: { entryNumber: true } },
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException("Enrollment not found");
        }
        const advisor = await this.prisma.user.findUnique({
            where: { id: advisorId },
            select: { department: true },
        });
        if (!advisor?.department) {
            throw new common_1.ForbiddenException('Advisor does not have a department assigned');
        }
        const studentBranch = enrollment.student.entryNumber?.substring(4, 7);
        if (!studentBranch || !(0, branch_department_mapping_1.isDepartmentBranchMatch)(advisor.department, studentBranch)) {
            throw new common_1.ForbiddenException("You are not allowed to reject this enrollment (department/branch mismatch)");
        }
        if (enrollment.status !== client_1.EnrollmentStatus.PENDING_ADVISOR) {
            throw new common_1.ForbiddenException("Enrollment is not pending advisor approval");
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
    async getStudentEnrollments(studentId) {
        const enrollments = await this.prisma.enrollment.findMany({
            where: { studentId },
            include: {
                courseOffering: {
                    include: {
                        course: true,
                        instructor: {
                            select: { name: true, email: true },
                        },
                    },
                },
            },
            orderBy: [
                { createdAt: 'desc' },
            ],
        });
        return enrollments.map(e => ({
            id: e.id,
            status: e.status,
            enrollmentType: e.enrollmentType,
            grade: e.grade,
            source: e.source,
            createdAt: e.createdAt,
            approvedAt: e.approvedAt,
            completedAt: e.completedAt,
            courseOffering: {
                id: e.courseOffering.id,
                semester: e.courseOffering.semester,
                timeSlot: e.courseOffering.timeSlot,
                status: e.courseOffering.status,
                course: {
                    id: e.courseOffering.course.id,
                    code: e.courseOffering.course.code,
                    name: e.courseOffering.course.name,
                    credits: e.courseOffering.course.credits,
                },
                instructor: {
                    name: e.courseOffering.instructor.name,
                    email: e.courseOffering.instructor.email,
                },
            },
        }));
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
                student: { select: { name: true, entryNumber: true, email: true } },
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
            const allowedStatuses = [
                client_1.EnrollmentStatus.ENROLLED,
                client_1.EnrollmentStatus.AUDIT,
                client_1.EnrollmentStatus.COMPLETED,
            ];
            if (!allowedStatuses.includes(enrollment.status))
                continue;
            const updated = await this.prisma.enrollment.update({
                where: { id: enrollment.id },
                data: {
                    grade: item.grade,
                    status: client_1.EnrollmentStatus.COMPLETED,
                    completedAt: enrollment.completedAt ?? new Date(),
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