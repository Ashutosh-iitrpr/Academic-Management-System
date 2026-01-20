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
exports.AcademicCalendarService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AcademicCalendarService = class AcademicCalendarService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCalendar() {
        const calendar = await this.prisma.academicCalendar.findFirst();
        if (!calendar) {
            throw new common_1.BadRequestException("Academic calendar not configured");
        }
        return calendar;
    }
    async getCurrentSemester() {
        const calendar = await this.getCalendar();
        const now = new Date();
        if (now >= calendar.semesterStartDate && now <= calendar.semesterEndDate) {
            return {
                name: calendar.semesterName,
                startDate: calendar.semesterStartDate,
                endDate: calendar.semesterEndDate,
            };
        }
        return {
            name: calendar.semesterName,
            startDate: calendar.semesterStartDate,
            endDate: calendar.semesterEndDate,
        };
    }
    async getCurrentSemesterName() {
        const calendar = await this.getCalendar();
        return calendar.semesterName;
    }
    async isWithinCurrentSemester(date = new Date()) {
        const calendar = await this.getCalendar();
        return date >= calendar.semesterStartDate && date <= calendar.semesterEndDate;
    }
    async assertEnrollmentOpen() {
        const c = await this.getCalendar();
        const now = new Date();
        if (now < c.enrollmentStart || now > c.enrollmentEnd) {
            throw new common_1.BadRequestException("Enrollment period is closed");
        }
    }
    async assertDropAllowed() {
        const c = await this.getCalendar();
        if (new Date() > c.dropDeadline) {
            throw new common_1.BadRequestException("Drop deadline has passed");
        }
    }
    async assertAuditAllowed() {
        const c = await this.getCalendar();
        if (new Date() > c.auditDeadline) {
            throw new common_1.BadRequestException("Audit deadline has passed");
        }
    }
};
exports.AcademicCalendarService = AcademicCalendarService;
exports.AcademicCalendarService = AcademicCalendarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AcademicCalendarService);
//# sourceMappingURL=academic-calendar.service.js.map