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
                enrollmentStart: new Date(dto.enrollmentStart),
                enrollmentEnd: new Date(dto.enrollmentEnd),
                dropDeadline: new Date(dto.dropDeadline),
                auditDeadline: new Date(dto.auditDeadline),
            },
        });
    }
    updateCalendar(dto) {
        return this.prisma.academicCalendar.updateMany({
            data: {
                enrollmentStart: new Date(dto.enrollmentStart),
                enrollmentEnd: new Date(dto.enrollmentEnd),
                dropDeadline: new Date(dto.dropDeadline),
                auditDeadline: new Date(dto.auditDeadline),
            },
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
    getAllUsers() {
        return [
            {
                id: "1",
                name: "John Doe",
                email: "john@example.com",
                role: "STUDENT",
                entryNumber: "2024CS001",
                isActive: true,
                createdAt: new Date(),
            },
            {
                id: "2",
                name: "Jane Smith",
                email: "jane@example.com",
                role: "INSTRUCTOR",
                entryNumber: null,
                isActive: true,
                createdAt: new Date(),
            },
        ];
    }
    getTranscriptByEntry(entryNumber) {
        return {
            student: {
                id: "1",
                name: "John Doe",
                email: "john@example.com",
                entryNumber: entryNumber,
                branch: "Computer Science",
            },
            cgpa: 8.5,
            totalCredits: 120,
            semesters: [
                {
                    semester: "Fall 2024",
                    sgpa: 8.7,
                    courses: [
                        {
                            code: "CS101",
                            name: "Introduction to Programming",
                            credits: 4,
                            grade: "A",
                        },
                        {
                            code: "CS102",
                            name: "Data Structures",
                            credits: 4,
                            grade: "A-",
                        },
                    ],
                },
            ],
        };
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
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)("transcript/entry/:entryNumber"),
    __param(0, (0, common_1.Param)("entryNumber")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
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