import { CourseOfferingsService } from "./course-offerings.service";
import { RequestOfferingDto } from "./dto/request-offering.dto";
export declare class CourseOfferingsController {
    private readonly courseOfferingsService;
    constructor(courseOfferingsService: CourseOfferingsService);
    getStudentCourseOfferings(courseCode?: string): Promise<({
        course: {
            name: string;
            id: string;
            createdAt: Date;
            code: string;
            credits: number;
            description: string | null;
        };
        instructor: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        courseId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        instructorId: string;
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
    })[]>;
    getInstructorCourseOfferings(req: any): Promise<({
        course: {
            name: string;
            code: string;
            credits: number;
        };
        _count: {
            enrollments: number;
        };
    } & {
        id: string;
        createdAt: Date;
        courseId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        instructorId: string;
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
    })[]>;
    requestOffering(dto: RequestOfferingDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        courseId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        instructorId: string;
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
    }>;
    finalizeOffering(offeringId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        courseId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        instructorId: string;
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
    }>;
    getAllCourseOfferings(): Promise<({
        course: {
            name: string;
            code: string;
            credits: number;
        };
        _count: {
            enrollments: number;
        };
        instructor: {
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        courseId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        instructorId: string;
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
    })[]>;
    getInstructorSemesters(): Promise<string[]>;
    getPendingOfferings(): Promise<({
        course: {
            name: string;
            id: string;
            createdAt: Date;
            code: string;
            credits: number;
            description: string | null;
        };
        enrollments: {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.EnrollmentStatus;
            approvedAt: Date | null;
            completedAt: Date | null;
            courseOfferingId: string;
            enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
            studentId: string;
            grade: import("@prisma/client").$Enums.Grade | null;
            source: import("@prisma/client").$Enums.EnrollmentSource;
        }[];
        instructor: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        courseId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        instructorId: string;
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
    })[]>;
    approveOffering(id: string): Promise<{
        id: string;
        createdAt: Date;
        courseId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        instructorId: string;
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
    }>;
    rejectOffering(id: string): Promise<{
        id: string;
        createdAt: Date;
        courseId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        instructorId: string;
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
    }>;
    withdrawOffering(id: string): Promise<{
        id: string;
        createdAt: Date;
        courseId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        instructorId: string;
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
    }>;
}
