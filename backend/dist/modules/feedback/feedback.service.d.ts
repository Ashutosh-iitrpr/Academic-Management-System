import { PrismaService } from "../../prisma/prisma.service";
export declare class FeedbackService {
    private prisma;
    constructor(prisma: PrismaService);
    openFeedbackForm(instructorId: string, courseOfferingId: string, dto: {
        title?: string;
        description?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        instructorId: string;
        courseOfferingId: string;
        title: string | null;
        isOpen: boolean;
        closedAt: Date | null;
    }>;
    closeFeedbackForm(instructorId: string, formId: string): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        instructorId: string;
        courseOfferingId: string;
        title: string | null;
        isOpen: boolean;
        closedAt: Date | null;
    }>;
    getFeedbackResults(instructorId: string, courseOfferingId: string): Promise<{
        responses: number;
        averages: {
            ratingContent: string;
            ratingTeaching: string;
            ratingEvaluation: string;
            ratingOverall: string;
        } | null;
        comments: string[];
    }>;
    listFeedbackForms(instructorId: string, courseOfferingId: string): Promise<{
        id: string;
        createdAt: Date;
        _count: {
            responses: number;
        };
        description: string | null;
        title: string | null;
        isOpen: boolean;
        closedAt: Date | null;
    }[]>;
    getAvailableFeedbackForms(studentId: string): Promise<{
        courseOffering: {
            course: {
                name: string;
                code: string;
            };
            semester: string;
            instructor: {
                name: string;
            };
        };
        id: string;
        description: string | null;
        title: string | null;
    }[]>;
    submitFeedback(studentId: string, feedbackFormId: string, dto: {
        ratingContent: number;
        ratingTeaching: number;
        ratingEvaluation: number;
        ratingOverall: number;
        comments?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        studentId: string;
        feedbackFormId: string;
        ratingContent: number;
        ratingTeaching: number;
        ratingEvaluation: number;
        ratingOverall: number;
        comments: string | null;
    }>;
    getFeedbackResultsForForm(instructorId: string, formId: string): Promise<{
        responses: number;
        averages: null;
        comments: never[];
        form?: undefined;
    } | {
        form: {
            id: string;
            title: string | null;
            createdAt: Date;
            closedAt: Date | null;
        };
        responses: number;
        averages: {
            ratingContent: string;
            ratingTeaching: string;
            ratingEvaluation: string;
            ratingOverall: string;
        };
        comments: string[];
    }>;
    getFeedbackResultsByOffering(instructorId: string, courseOfferingId: string): Promise<({
        formId: string;
        title: string | null;
        isOpen: boolean;
        responses: number;
        averages: null;
        createdAt?: undefined;
        closedAt?: undefined;
    } | {
        formId: string;
        title: string | null;
        isOpen: boolean;
        createdAt: Date;
        closedAt: Date | null;
        responses: number;
        averages: {
            ratingContent: string;
            ratingTeaching: string;
            ratingEvaluation: string;
            ratingOverall: string;
        };
    })[]>;
}
