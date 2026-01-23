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
const platform_express_1 = require("@nestjs/platform-express");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const update_user_dto_1 = require("./dto/update-user.dto");
let AdminController = class AdminController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    createCalendar(dto) {
        if (!dto.semesterName || !dto.semesterName.trim()) {
            throw new common_1.BadRequestException("Semester name is required");
        }
        const parseDate = (dateString, fieldName) => {
            if (!dateString) {
                throw new common_1.BadRequestException(`${fieldName} is required`);
            }
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                throw new common_1.BadRequestException(`Invalid ${fieldName} format. Please use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)`);
            }
            return date;
        };
        const semesterStartDate = parseDate(dto.semesterStartDate, "Semester start date");
        const semesterEndDate = parseDate(dto.semesterEndDate, "Semester end date");
        const enrollmentStart = parseDate(dto.enrollmentStart, "Enrollment start date");
        const enrollmentEnd = parseDate(dto.enrollmentEnd, "Enrollment end date");
        const dropDeadline = parseDate(dto.dropDeadline, "Drop deadline");
        const auditDeadline = parseDate(dto.auditDeadline, "Audit deadline");
        if (semesterStartDate >= semesterEndDate) {
            throw new common_1.BadRequestException("Semester start date must be before semester end date");
        }
        if (enrollmentStart >= enrollmentEnd) {
            throw new common_1.BadRequestException("Enrollment start date must be before enrollment end date");
        }
        return this.prisma.academicCalendar.create({
            data: {
                semesterName: dto.semesterName.trim(),
                semesterStartDate,
                semesterEndDate,
                enrollmentStart,
                enrollmentEnd,
                dropDeadline,
                auditDeadline,
            },
        });
    }
    updateCalendar(dto) {
        const data = {};
        if (dto.semesterName && dto.semesterName.trim()) {
            data.semesterName = dto.semesterName.trim();
        }
        const parseDate = (dateString, fieldName) => {
            if (!dateString) {
                throw new common_1.BadRequestException(`${fieldName} is required`);
            }
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                throw new common_1.BadRequestException(`Invalid ${fieldName} format. Please use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)`);
            }
            return date;
        };
        if (dto.semesterStartDate)
            data.semesterStartDate = parseDate(dto.semesterStartDate, "Semester start date");
        if (dto.semesterEndDate)
            data.semesterEndDate = parseDate(dto.semesterEndDate, "Semester end date");
        if (dto.enrollmentStart)
            data.enrollmentStart = parseDate(dto.enrollmentStart, "Enrollment start date");
        if (dto.enrollmentEnd)
            data.enrollmentEnd = parseDate(dto.enrollmentEnd, "Enrollment end date");
        if (dto.dropDeadline)
            data.dropDeadline = parseDate(dto.dropDeadline, "Drop deadline");
        if (dto.auditDeadline)
            data.auditDeadline = parseDate(dto.auditDeadline, "Audit deadline");
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
                department: true,
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
                    department: dto.role === "INSTRUCTOR" ? dto.department : null,
                },
            });
        }
        catch (error) {
            throw new common_1.NotFoundException("User with this email or entry number already exists");
        }
    }
    async bulkUploadUsers(file) {
        if (!file) {
            throw new common_1.BadRequestException("No file uploaded");
        }
        if (!file.originalname.endsWith(".csv")) {
            throw new common_1.BadRequestException("Only CSV files are accepted");
        }
        try {
            const csvContent = file.buffer.toString("utf-8");
            const lines = csvContent.split("\n").filter((line) => line.trim());
            if (lines.length < 2) {
                throw new common_1.BadRequestException("CSV must contain headers and at least one data row");
            }
            const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
            const nameIndex = headers.indexOf("name");
            const emailIndex = headers.indexOf("email");
            const roleIndex = headers.indexOf("role");
            const entryNumberIndex = headers.indexOf("entrynumber");
            const departmentIndex = headers.indexOf("department");
            if (nameIndex === -1 || emailIndex === -1 || roleIndex === -1) {
                throw new common_1.BadRequestException("CSV must contain columns: name, email, role");
            }
            const results = [];
            let createdCount = 0;
            let failedCount = 0;
            const errors = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(",").map((v) => v.trim());
                if (values.length < 3)
                    continue;
                const name = values[nameIndex];
                const email = values[emailIndex];
                const role = values[roleIndex]?.toUpperCase();
                const entryNumber = entryNumberIndex >= 0 ? values[entryNumberIndex] : null;
                const department = departmentIndex >= 0 ? values[departmentIndex] : null;
                if (!name || !email || !role) {
                    errors.push(`Row ${i + 1}: Missing required fields`);
                    failedCount++;
                    continue;
                }
                if (!["STUDENT", "INSTRUCTOR", "ADMIN"].includes(role)) {
                    errors.push(`Row ${i + 1}: Invalid role '${role}'`);
                    failedCount++;
                    continue;
                }
                if (role === "STUDENT" && !entryNumber) {
                    errors.push(`Row ${i + 1}: Entry number required for students`);
                    failedCount++;
                    continue;
                }
                if (role === "INSTRUCTOR" && !department) {
                    errors.push(`Row ${i + 1}: Department required for instructors`);
                    failedCount++;
                    continue;
                }
                try {
                    await this.prisma.user.create({
                        data: {
                            name,
                            email,
                            role: role,
                            entryNumber: role === "STUDENT" ? entryNumber : null,
                            department: role === "INSTRUCTOR" ? department : null,
                        },
                    });
                    createdCount++;
                }
                catch (error) {
                    errors.push(`Row ${i + 1}: ${error.message.includes("Unique constraint")
                        ? "Email or entry number already exists"
                        : error.message}`);
                    failedCount++;
                }
            }
            return {
                createdCount,
                failedCount,
                totalProcessed: createdCount + failedCount,
                errors: errors.slice(0, 10),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || "Error processing CSV file");
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
    async updateUser(id, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        const data = {};
        if (dto.name !== undefined) {
            data.name = dto.name;
        }
        if (dto.email !== undefined) {
            data.email = dto.email;
        }
        if (user.role === "STUDENT") {
            if (dto.entryNumber !== undefined) {
                data.entryNumber = dto.entryNumber;
            }
        }
        else {
            if (dto.entryNumber !== undefined) {
                throw new common_1.BadRequestException("Only students can have entry numbers");
            }
        }
        if (user.role === "INSTRUCTOR") {
            if (dto.department !== undefined) {
                data.department = dto.department;
            }
        }
        else {
            if (dto.department !== undefined) {
                throw new common_1.BadRequestException("Only instructors can have departments");
            }
        }
        try {
            return await this.prisma.user.update({
                where: { id },
                data,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    entryNumber: true,
                    department: true,
                    isActive: true,
                    createdAt: true,
                },
            });
        }
        catch (error) {
            if (error?.code === "P2002") {
                throw new common_1.ConflictException("Email or entry number already in use");
            }
            throw error;
        }
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
                ...(dto.description !== undefined && { description: dto.description }),
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
    (0, common_1.Post)("users/bulk-upload"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bulkUploadUsers", null);
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
    (0, common_1.Patch)("users/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
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