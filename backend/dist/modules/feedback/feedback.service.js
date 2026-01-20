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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FeedbackService = class FeedbackService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async openFeedbackForm(instructorId, courseOfferingId, dto) {
        const offering = await this.prisma.courseOffering.findUnique({
            where: { id: courseOfferingId },
        });
        if (!offering) {
            throw new common_1.NotFoundException("Course offering not found");
        }
        if (offering.instructorId !== instructorId) {
            throw new common_1.ForbiddenException("You do not own this course offering");
        }
        const openForm = await this.prisma.feedbackForm.findFirst({
            where: {
                courseOfferingId,
                isOpen: true,
            },
        });
        if (openForm) {
            throw new common_1.BadRequestException("A feedback form is already open for this course");
        }
        return this.prisma.feedbackForm.create({
            data: {
                courseOfferingId,
                instructorId,
                title: dto.title,
                description: dto.description,
            },
        });
    }
    async closeFeedbackForm(instructorId, formId) {
        const form = await this.prisma.feedbackForm.findUnique({
            where: { id: formId },
        });
        if (!form) {
            throw new common_1.NotFoundException("Feedback form not found");
        }
        if (form.instructorId !== instructorId) {
            throw new common_1.ForbiddenException("You do not own this feedback form");
        }
        if (!form.isOpen) {
            throw new common_1.BadRequestException("Feedback form already closed");
        }
        return this.prisma.feedbackForm.update({
            where: { id: formId },
            data: {
                isOpen: false,
                closedAt: new Date(),
            },
        });
    }
    async getFeedbackResults(instructorId, courseOfferingId) {
        const offering = await this.prisma.courseOffering.findUnique({
            where: { id: courseOfferingId },
        });
        if (!offering) {
            throw new common_1.NotFoundException("Course offering not found");
        }
        if (offering.instructorId !== instructorId) {
            throw new common_1.ForbiddenException("You do not own this course offering");
        }
        const forms = await this.prisma.feedbackForm.findMany({
            where: { courseOfferingId },
            include: {
                responses: true,
            },
        });
        if (forms.length === 0) {
            return {
                responses: 0,
                averages: null,
                comments: [],
            };
        }
        let count = 0;
        let totals = {
            ratingContent: 0,
            ratingTeaching: 0,
            ratingEvaluation: 0,
            ratingOverall: 0,
        };
        const comments = [];
        for (const form of forms) {
            for (const r of form.responses) {
                count++;
                totals.ratingContent += r.ratingContent;
                totals.ratingTeaching += r.ratingTeaching;
                totals.ratingEvaluation += r.ratingEvaluation;
                totals.ratingOverall += r.ratingOverall;
                if (r.comments) {
                    comments.push(r.comments);
                }
            }
        }
        return {
            responses: count,
            averages: count === 0
                ? null
                : {
                    ratingContent: (totals.ratingContent / count).toFixed(2),
                    ratingTeaching: (totals.ratingTeaching / count).toFixed(2),
                    ratingEvaluation: (totals.ratingEvaluation / count).toFixed(2),
                    ratingOverall: (totals.ratingOverall / count).toFixed(2),
                },
            comments,
        };
    }
    async listFeedbackForms(instructorId, courseOfferingId) {
        const offering = await this.prisma.courseOffering.findUnique({
            where: { id: courseOfferingId },
        });
        if (!offering) {
            throw new common_1.NotFoundException("Course offering not found");
        }
        if (offering.instructorId !== instructorId) {
            throw new common_1.ForbiddenException("You do not own this course offering");
        }
        return this.prisma.feedbackForm.findMany({
            where: { courseOfferingId },
            select: {
                id: true,
                title: true,
                description: true,
                isOpen: true,
                createdAt: true,
                closedAt: true,
                _count: {
                    select: { responses: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async getAvailableFeedbackForms(studentId) {
        return this.prisma.feedbackForm.findMany({
            where: {
                isOpen: true,
                courseOffering: {
                    enrollments: {
                        some: {
                            studentId,
                        },
                    },
                },
            },
            select: {
                id: true,
                title: true,
                description: true,
                courseOffering: {
                    select: {
                        semester: true,
                        course: {
                            select: {
                                code: true,
                                name: true,
                            },
                        },
                        instructor: {
                            select: { name: true },
                        },
                    },
                },
            },
        });
    }
    async submitFeedback(studentId, feedbackFormId, dto) {
        const form = await this.prisma.feedbackForm.findUnique({
            where: { id: feedbackFormId },
            include: {
                courseOffering: {
                    include: {
                        enrollments: true,
                    },
                },
            },
        });
        if (!form) {
            throw new common_1.NotFoundException("Feedback form not found");
        }
        if (!form.isOpen) {
            throw new common_1.BadRequestException("Feedback form is closed");
        }
        const isEnrolled = form.courseOffering.enrollments.some((e) => e.studentId === studentId);
        if (!isEnrolled) {
            throw new common_1.ForbiddenException("You are not enrolled in this course");
        }
        const existing = await this.prisma.courseFeedback.findFirst({
            where: {
                feedbackFormId,
                studentId,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException("Feedback already submitted");
        }
        return this.prisma.courseFeedback.create({
            data: {
                feedbackFormId,
                studentId,
                ratingContent: dto.ratingContent,
                ratingTeaching: dto.ratingTeaching,
                ratingEvaluation: dto.ratingEvaluation,
                ratingOverall: dto.ratingOverall,
                comments: dto.comments,
            },
        });
    }
    async getFeedbackResultsForForm(instructorId, formId) {
        const form = await this.prisma.feedbackForm.findUnique({
            where: { id: formId },
            include: {
                responses: true,
                courseOffering: true,
            },
        });
        if (!form) {
            throw new common_1.NotFoundException("Feedback form not found");
        }
        if (form.instructorId !== instructorId) {
            throw new common_1.ForbiddenException("You do not own this feedback form");
        }
        const responses = form.responses;
        if (responses.length === 0) {
            return {
                responses: 0,
                averages: null,
                comments: [],
            };
        }
        const totals = {
            ratingContent: 0,
            ratingTeaching: 0,
            ratingEvaluation: 0,
            ratingOverall: 0,
        };
        const comments = [];
        for (const r of responses) {
            totals.ratingContent += r.ratingContent;
            totals.ratingTeaching += r.ratingTeaching;
            totals.ratingEvaluation += r.ratingEvaluation;
            totals.ratingOverall += r.ratingOverall;
            if (r.comments) {
                comments.push(r.comments);
            }
        }
        const count = responses.length;
        return {
            form: {
                id: form.id,
                title: form.title,
                createdAt: form.createdAt,
                closedAt: form.closedAt,
            },
            responses: count,
            averages: {
                ratingContent: (totals.ratingContent / count).toFixed(2),
                ratingTeaching: (totals.ratingTeaching / count).toFixed(2),
                ratingEvaluation: (totals.ratingEvaluation / count).toFixed(2),
                ratingOverall: (totals.ratingOverall / count).toFixed(2),
            },
            comments,
        };
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map