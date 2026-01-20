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
exports.FeedbackController = void 0;
const common_1 = require("@nestjs/common");
const feedback_service_1 = require("./feedback.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const create_feedback_form_dto_1 = require("./dto/create-feedback-form.dto");
const submit_feedback_dto_1 = require("./dto/submit-feedback.dto");
let FeedbackController = class FeedbackController {
    feedbackService;
    constructor(feedbackService) {
        this.feedbackService = feedbackService;
    }
    openFeedback(courseOfferingId, dto, req) {
        return this.feedbackService.openFeedbackForm(req.user.userId, courseOfferingId, dto);
    }
    closeFeedback(formId, req) {
        return this.feedbackService.closeFeedbackForm(req.user.userId, formId);
    }
    listFeedbackForms(courseOfferingId, req) {
        return this.feedbackService.listFeedbackForms(req.user.userId, courseOfferingId);
    }
    getFeedbackResults(formId, req) {
        return this.feedbackService.getFeedbackResultsForForm(req.user.userId, formId);
    }
    getAvailableFeedback(req) {
        return this.feedbackService.getAvailableFeedbackForms(req.user.userId);
    }
    submitFeedback(formId, dto, req) {
        return this.feedbackService.submitFeedback(req.user.userId, formId, dto);
    }
};
exports.FeedbackController = FeedbackController;
__decorate([
    (0, common_1.Post)("instructor/course-offerings/:id/feedback-forms"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_feedback_form_dto_1.CreateFeedbackFormDto, Object]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "openFeedback", null);
__decorate([
    (0, common_1.Patch)("instructor/feedback-forms/:id/close"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "closeFeedback", null);
__decorate([
    (0, common_1.Get)("instructor/course-offerings/:id/feedback-forms"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "listFeedbackForms", null);
__decorate([
    (0, common_1.Get)("instructor/feedback-forms/:id/results"),
    (0, roles_decorator_1.Roles)("INSTRUCTOR"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "getFeedbackResults", null);
__decorate([
    (0, common_1.Get)("student/feedback"),
    (0, roles_decorator_1.Roles)("STUDENT"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "getAvailableFeedback", null);
__decorate([
    (0, common_1.Post)("student/feedback/:formId"),
    (0, roles_decorator_1.Roles)("STUDENT"),
    __param(0, (0, common_1.Param)("formId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, submit_feedback_dto_1.SubmitFeedbackDto, Object]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "submitFeedback", null);
exports.FeedbackController = FeedbackController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [feedback_service_1.FeedbackService])
], FeedbackController);
//# sourceMappingURL=feedback.controller.js.map