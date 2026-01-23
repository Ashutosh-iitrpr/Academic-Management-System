import { FeedbackService } from "./feedback.service";
import { CreateFeedbackFormDto } from "./dto/create-feedback-form.dto";
import { SubmitFeedbackDto } from "./dto/submit-feedback.dto";
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
    openFeedback(courseOfferingId: string, dto: CreateFeedbackFormDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        instructorId: string;
        courseOfferingId: string;
        title: string | null;
        isOpen: boolean;
        closedAt: Date | null;
    }>;
    closeFeedback(formId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        instructorId: string;
        courseOfferingId: string;
        title: string | null;
        isOpen: boolean;
        closedAt: Date | null;
    }>;
    listFeedbackForms(courseOfferingId: string, req: any): Promise<{
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
    getFeedbackResults(formId: string, req: any): Promise<{
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
    getFeedbackResultsByOffering(courseOfferingId: string, req: any): Promise<({
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
    getAvailableFeedback(req: any): Promise<{
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
    submitFeedback(formId: string, dto: SubmitFeedbackDto, req: any): Promise<{
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
}
