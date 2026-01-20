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
        instructorId: string;
        courseOfferingId: string;
        title: string | null;
        description: string | null;
        isOpen: boolean;
        closedAt: Date | null;
    }>;
    closeFeedbackForm(instructorId: string, formId: string): Promise<{
        id: string;
        createdAt: Date;
        instructorId: string;
        courseOfferingId: string;
        title: string | null;
        description: string | null;
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
        title: string | null;
        description: string | null;
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
        title: string | null;
        description: string | null;
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
}
