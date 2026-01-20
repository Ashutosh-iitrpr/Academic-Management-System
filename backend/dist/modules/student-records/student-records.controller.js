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
exports.StudentRecordsController = void 0;
const common_1 = require("@nestjs/common");
const student_records_service_1 = require("./student-records.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const common_2 = require("@nestjs/common");
let StudentRecordsController = class StudentRecordsController {
    studentRecordsService;
    constructor(studentRecordsService) {
        this.studentRecordsService = studentRecordsService;
    }
    getStudentRecord(req) {
        return this.studentRecordsService.getStudentRecord(req.user.userId);
    }
    getStudentRecordBySemester(req, semester) {
        return this.studentRecordsService.getStudentRecordBySemester(req.user.userId, semester);
    }
    getTranscript(req) {
        return this.studentRecordsService.getTranscript(req.user.userId);
    }
    getStudentTranscriptForAdmin(studentId) {
        return this.studentRecordsService.getTranscript(studentId);
    }
    getStudentTranscriptForInstructor(studentId) {
        return this.studentRecordsService.getTranscript(studentId);
    }
};
exports.StudentRecordsController = StudentRecordsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "getStudentRecord", null);
__decorate([
    (0, common_1.Get)("semester/:semester"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_2.Param)("semester")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "getStudentRecordBySemester", null);
__decorate([
    (0, common_1.Get)("transcript"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("STUDENT"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "getTranscript", null);
__decorate([
    (0, common_1.Get)("admin/students/:studentId/transcript"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("ADMIN"),
    __param(0, (0, common_2.Param)("studentId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "getStudentTranscriptForAdmin", null);
__decorate([
    (0, common_1.Get)("instructor/students/:studentId/transcript"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __param(0, (0, common_2.Param)("studentId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentRecordsController.prototype, "getStudentTranscriptForInstructor", null);
exports.StudentRecordsController = StudentRecordsController = __decorate([
    (0, common_1.Controller)("student/record"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [student_records_service_1.StudentRecordsService])
], StudentRecordsController);
//# sourceMappingURL=student-records.controller.js.map