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
exports.CourseOfferingsController = void 0;
const common_1 = require("@nestjs/common");
const course_offerings_service_1 = require("./course-offerings.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const common_2 = require("@nestjs/common");
const request_offering_dto_1 = require("./dto/request-offering.dto");
let CourseOfferingsController = class CourseOfferingsController {
    courseOfferingsService;
    constructor(courseOfferingsService) {
        this.courseOfferingsService = courseOfferingsService;
    }
    getStudentCourseOfferings(courseCode) {
        return this.courseOfferingsService.getForStudent(courseCode);
    }
    getInstructorCourseOfferings(req) {
        return this.courseOfferingsService.getForInstructor(req.user.userId);
    }
    getGradeDistribution(offeringId) {
        return this.courseOfferingsService.getGradeDistribution(offeringId);
    }
    requestOffering(dto, req) {
        return this.courseOfferingsService.requestOffering(req.user.userId, dto);
    }
    finalizeOffering(offeringId, req) {
        return this.courseOfferingsService.finalizeOffering(req.user.userId, offeringId);
    }
    getAllCourseOfferings() {
        return this.courseOfferingsService.getAllOfferings();
    }
    getInstructorSemesters() {
        return this.courseOfferingsService.getInstructorSemesters();
    }
    getPendingOfferings() {
        return this.courseOfferingsService.getPendingOfferings();
    }
    approveOffering(id) {
        return this.courseOfferingsService.approveOffering(id);
    }
    rejectOffering(id) {
        return this.courseOfferingsService.rejectOffering(id);
    }
    withdrawOffering(id) {
        return this.courseOfferingsService.withdrawOffering(id);
    }
};
exports.CourseOfferingsController = CourseOfferingsController;
__decorate([
    (0, common_1.Get)("student/course-offerings"),
    (0, roles_decorator_1.Roles)("STUDENT"),
    __param(0, (0, common_1.Query)("courseCode")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CourseOfferingsController.prototype, "getStudentCourseOfferings", null);
__decorate([
    (0, common_1.Get)("instructor/course-offerings"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CourseOfferingsController.prototype, "getInstructorCourseOfferings", null);
__decorate([
    (0, common_1.Get)("student/course-offerings/:id/grade-distribution"),
    (0, roles_decorator_1.Roles)("STUDENT"),
    __param(0, (0, common_2.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CourseOfferingsController.prototype, "getGradeDistribution", null);
__decorate([
    (0, common_1.Post)("instructor/course-offerings"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_offering_dto_1.RequestOfferingDto, Object]),
    __metadata("design:returntype", void 0)
], CourseOfferingsController.prototype, "requestOffering", null);
__decorate([
    (0, common_1.Post)("instructor/course-offerings/:id/finalize"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __param(0, (0, common_2.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CourseOfferingsController.prototype, "finalizeOffering", null);
__decorate([
    (0, common_1.Get)("instructor/all-course-offerings"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CourseOfferingsController.prototype, "getAllCourseOfferings", null);
__decorate([
    (0, common_1.Get)("instructor/semesters"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CourseOfferingsController.prototype, "getInstructorSemesters", null);
__decorate([
    (0, common_1.Get)("admin/course-offerings"),
    (0, roles_decorator_1.Roles)("ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CourseOfferingsController.prototype, "getPendingOfferings", null);
__decorate([
    (0, common_2.Patch)("admin/course-offerings/:id/approve"),
    (0, roles_decorator_1.Roles)("ADMIN"),
    __param(0, (0, common_2.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CourseOfferingsController.prototype, "approveOffering", null);
__decorate([
    (0, common_2.Patch)("admin/course-offerings/:id/reject"),
    (0, roles_decorator_1.Roles)("ADMIN"),
    __param(0, (0, common_2.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CourseOfferingsController.prototype, "rejectOffering", null);
__decorate([
    (0, common_2.Patch)("admin/course-offerings/:id/withdraw"),
    (0, roles_decorator_1.Roles)("ADMIN"),
    __param(0, (0, common_2.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CourseOfferingsController.prototype, "withdrawOffering", null);
exports.CourseOfferingsController = CourseOfferingsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [course_offerings_service_1.CourseOfferingsService])
], CourseOfferingsController);
//# sourceMappingURL=course-offerings.controller.js.map