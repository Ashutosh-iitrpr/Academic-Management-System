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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let AdminController = class AdminController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    createCalendar(dto) {
        return this.prisma.academicCalendar.create({
            data: {
                semesterName: dto.semesterName,
                semesterStartDate: new Date(dto.semesterStartDate),
                semesterEndDate: new Date(dto.semesterEndDate),
                enrollmentStart: new Date(dto.enrollmentStart),
                enrollmentEnd: new Date(dto.enrollmentEnd),
                dropDeadline: new Date(dto.dropDeadline),
                auditDeadline: new Date(dto.auditDeadline),
            },
        });
    }
    updateCalendar(dto) {
        const data = {};
        if (dto.semesterName)
            data.semesterName = dto.semesterName;
        if (dto.semesterStartDate)
            data.semesterStartDate = new Date(dto.semesterStartDate);
        if (dto.semesterEndDate)
            data.semesterEndDate = new Date(dto.semesterEndDate);
        if (dto.enrollmentStart)
            data.enrollmentStart = new Date(dto.enrollmentStart);
        if (dto.enrollmentEnd)
            data.enrollmentEnd = new Date(dto.enrollmentEnd);
        if (dto.dropDeadline)
            data.dropDeadline = new Date(dto.dropDeadline);
        if (dto.auditDeadline)
            data.auditDeadline = new Date(dto.auditDeadline);
        return this.prisma.academicCalendar.updateMany({
            data,
        });
    }
    getCalendar() {
        return this.prisma.academicCalendar.findFirst();
    }
    getCalendarForStudent() {
        return this.prisma.academicCalendar.findFirst({
            select: {
                enrollmentStart: true,
                enrollmentEnd: true,
                dropDeadline: true,
                auditDeadline: true,
            },
        });
    }
    getCalendarForInstructor() {
        return this.prisma.academicCalendar.findFirst({
            select: {
                enrollmentStart: true,
                enrollmentEnd: true,
                dropDeadline: true,
                auditDeadline: true,
            },
        });
    }
    async getDashboardStats() {
        const [totalUsers, totalCourses, pendingApprovals, activeSemesters] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.course.count(),
            this.prisma.courseOffering.count({ where: { status: "PENDING" } }),
            this.prisma.academicCalendar.count(),
        ]);
        return {
            totalUsers,
            totalCourses,
            pendingApprovals,
            activeSemesters,
        };
    }
    async getAllUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                entryNumber: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async createUser(dto) {
        if (dto.role === "STUDENT" && !dto.entryNumber) {
            throw new common_1.NotFoundException("Entry number is required for students");
        }
        if (dto.role !== "STUDENT" && dto.entryNumber) {
            throw new common_1.NotFoundException("Only students can have entry numbers");
        }
        try {
            return await this.prisma.user.create({
                data: {
                    name: dto.name,
                    email: dto.email,
                    role: dto.role,
                    entryNumber: dto.role === "STUDENT" ? dto.entryNumber : null,
                },
            });
        }
        catch (error) {
            throw new common_1.NotFoundException("User with this email or entry number already exists");
        }
    }
    async deactivateUser(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async activateUser(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return this.prisma.user.update({
            where: { id },
            data: { isActive: true },
        });
    }
    async getTranscriptByEntry(entryNumber) {
        const student = await this.prisma.user.findFirst({
            where: {
                entryNumber: entryNumber,
                role: 'STUDENT',
            },
            include: {
                enrollments: {
                    include: {
                        courseOffering: {
                            include: {
                                course: true,
                                instructor: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!student) {
            throw new common_1.NotFoundException('Student not found with this entry number');
        }
        return student;
    }
    async getCourseEnrollments(courseId) {
        return this.prisma.enrollment.findMany({
            where: {
                courseOffering: {
                    courseId: courseId,
                },
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        entryNumber: true,
                    },
                },
                courseOffering: {
                    select: {
                        id: true,
                        course: {
                            select: {
                                code: true,
                                name: true,
                            },
                        },
                        instructor: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        semester: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async updateCourse(courseId, dto) {
        return this.prisma.course.update({
            where: { id: courseId },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.code && { code: dto.code }),
                ...(dto.credits && { credits: dto.credits }),
            },
        });
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)("academic-calendar"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createCalendar", null);
__decorate([
    (0, common_1.Patch)("academic-calendar"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateCalendar", null);
__decorate([
    (0, common_1.Get)("academic-calendar"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getCalendar", null);
__decorate([
    (0, common_1.Get)("academic-calendar/student"),
    (0, roles_decorator_1.Roles)("STUDENT"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getCalendarForStudent", null);
__decorate([
    (0, common_1.Get)("academic-calendar/instructor"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getCalendarForInstructor", null);
__decorate([
    (0, common_1.Get)("dashboard/stats"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)("users"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Post)("users"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createUser", null);
__decorate([
    (0, common_1.Patch)("users/:id/deactivate"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deactivateUser", null);
__decorate([
    (0, common_1.Patch)("users/:id/activate"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "activateUser", null);
__decorate([
    (0, common_1.Get)("transcript/entry/:entryNumber"),
    __param(0, (0, common_1.Param)("entryNumber")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTranscriptByEntry", null);
__decorate([
    (0, common_1.Get)("courses/:courseId/enrollments"),
    __param(0, (0, common_1.Param)("courseId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCourseEnrollments", null);
__decorate([
    (0, common_1.Patch)("courses/:courseId"),
    __param(0, (0, common_1.Param)("courseId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateCourse", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)("admin"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("ADMIN"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map