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
exports.EnrollmentsController = void 0;
const common_1 = require("@nestjs/common");
const enrollments_service_1 = require("./enrollments.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const request_enrollment_dto_1 = require("./dto/request-enrollment.dto");
const create_enrollment_trigger_dto_1 = require("./dto/create-enrollment-trigger.dto");
const upload_grades_dto_1 = require("./dto/upload-grades.dto");
const bulk_action_enrollments_dto_1 = require("./dto/bulk-action-enrollments.dto");
let EnrollmentsController = class EnrollmentsController {
    enrollmentsService;
    constructor(enrollmentsService) {
        this.enrollmentsService = enrollmentsService;
    }
    requestEnrollment(dto, req) {
        return this.enrollmentsService.requestEnrollment(req.user.userId, dto);
    }
    getMyEnrollments(req) {
        return this.enrollmentsService.getStudentEnrollments(req.user.userId);
    }
    getPendingEnrollments(req) {
        return this.enrollmentsService.getPendingForInstructor(req.user.userId);
    }
    approveEnrollment(id, req) {
        return this.enrollmentsService.approveEnrollment(req.user.userId, id);
    }
    rejectEnrollment(id, req) {
        return this.enrollmentsService.rejectEnrollment(req.user.userId, id);
    }
    bulkActionEnrollments(dto, req) {
        return this.enrollmentsService.bulkActionEnrollments(req.user.userId, dto);
    }
    createEnrollmentTrigger(dto, req) {
        return this.enrollmentsService.createEnrollmentTrigger(req.user.userId, dto);
    }
    getOfferingEnrollments(offeringId, req) {
        return this.enrollmentsService.getOfferingEnrollmentsForInstructor(req.user.userId, offeringId);
    }
    uploadGrades(offeringId, dto, req) {
        return this.enrollmentsService.uploadGrades(req.user.userId, offeringId, dto.grades);
    }
    dropEnrollment(id, req) {
        return this.enrollmentsService.dropEnrollment(req.user.userId, id);
    }
    auditEnrollment(id, req) {
        return this.enrollmentsService.auditEnrollment(req.user.userId, id);
    }
    getUnifiedEnrollmentList(offeringId, req) {
        return this.enrollmentsService.getUnifiedEnrollmentList({
            userId: req.user.userId,
            role: req.user.role,
        }, offeringId);
    }
};
exports.EnrollmentsController = EnrollmentsController;
__decorate([
    (0, common_1.Post)("student/enrollments"),
    (0, roles_decorator_1.Roles)("STUDENT"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_enrollment_dto_1.RequestEnrollmentDto, Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "requestEnrollment", null);
__decorate([
    (0, common_1.Get)("student/enrollments"),
    (0, roles_decorator_1.Roles)("STUDENT"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "getMyEnrollments", null);
__decorate([
    (0, common_1.Get)("instructor/enrollments/pending"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "getPendingEnrollments", null);
__decorate([
    (0, common_1.Patch)("instructor/enrollments/:id/approve"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "approveEnrollment", null);
__decorate([
    (0, common_1.Patch)("instructor/enrollments/:id/reject"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "rejectEnrollment", null);
__decorate([
    (0, common_1.Patch)("instructor/enrollments/bulk-action"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_action_enrollments_dto_1.BulkActionEnrollmentsDto, Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "bulkActionEnrollments", null);
__decorate([
    (0, common_1.Post)("instructor/enrollments/triggers"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_enrollment_trigger_dto_1.CreateEnrollmentTriggerDto, Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "createEnrollmentTrigger", null);
__decorate([
    (0, common_1.Get)("instructor/course-offerings/:id/enrollments"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "getOfferingEnrollments", null);
__decorate([
    (0, common_1.Post)("instructor/course-offerings/:id/grades"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upload_grades_dto_1.UploadGradesDto, Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "uploadGrades", null);
__decorate([
    (0, common_1.Patch)("student/enrollments/:id/drop"),
    (0, roles_decorator_1.Roles)("STUDENT"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "dropEnrollment", null);
__decorate([
    (0, common_1.Patch)("student/enrollments/:id/audit"),
    (0, roles_decorator_1.Roles)("STUDENT"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "auditEnrollment", null);
__decorate([
    (0, common_1.Get)("course-offerings/:id/enrollments"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "getUnifiedEnrollmentList", null);
exports.EnrollmentsController = EnrollmentsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [enrollments_service_1.EnrollmentsService])
], EnrollmentsController);
//# sourceMappingURL=enrollments.controller.js.map