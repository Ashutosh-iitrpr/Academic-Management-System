import { CourseOfferingsService } from "./course-offerings.service";
import { RequestOfferingDto } from "./dto/request-offering.dto";
export declare class CourseOfferingsController {
    private readonly courseOfferingsService;
    constructor(courseOfferingsService: CourseOfferingsService);
    getStudentCourseOfferings(courseCode?: string): Promise<({
        course: {
            id: string;
            createdAt: Date;
            code: string;
            name: string;
            credits: number;
            description: string | null;
            ltpsc: string | null;
        };
        instructor: {
            name: string;
        };
    } & {
        id: string;
        courseId: string;
        instructorId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
    })[]>;
    getInstructorCourseOfferings(req: any): Promise<({
        course: {
            code: string;
            name: string;
            credits: number;
        };
        _count: {
            enrollments: number;
        };
    } & {
        id: string;
        courseId: string;
        instructorId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
    })[]>;
    getGradeDistribution(offeringId: string): Promise<{
        total: number;
        distribution: {
            grade: import("@prisma/client").$Enums.Grade;
            count: number;
            percentage: number;
        }[];
    }>;
    requestOffering(dto: RequestOfferingDto, req: any): Promise<{
        id: string;
        courseId: string;
        instructorId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
    }>;
    finalizeOffering(offeringId: string, req: any): Promise<{
        id: string;
        courseId: string;
        instructorId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
    }>;
    getAllCourseOfferings(): Promise<({
        course: {
            code: string;
            name: string;
            credits: number;
        };
        instructor: {
            name: string;
            email: string;
        };
        _count: {
            enrollments: number;
        };
    } & {
        id: string;
        courseId: string;
        instructorId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
    })[]>;
    getInstructorSemesters(): Promise<string[]>;
    getPendingOfferings(): Promise<({
        course: {
            id: string;
            createdAt: Date;
            code: string;
            name: string;
            credits: number;
            description: string | null;
            ltpsc: string | null;
        };
        instructor: {
            id: string;
            name: string;
            email: string;
        };
        enrollments: {
            id: string;
            status: import("@prisma/client").$Enums.EnrollmentStatus;
            approvedAt: Date | null;
            completedAt: Date | null;
            createdAt: Date;
            studentId: string;
            courseOfferingId: string;
            enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
            advisorId: string | null;
            grade: import("@prisma/client").$Enums.Grade | null;
            source: import("@prisma/client").$Enums.EnrollmentSource;
        }[];
    } & {
        id: string;
        courseId: string;
        instructorId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
    })[]>;
    approveOffering(id: string): Promise<{
        id: string;
        courseId: string;
        instructorId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
    }>;
    rejectOffering(id: string): Promise<{
        id: string;
        courseId: string;
        instructorId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
    }>;
    withdrawOffering(id: string): Promise<{
        id: string;
        courseId: string;
        instructorId: string;
        semester: string;
        timeSlot: string;
        allowedBranches: string[];
        status: import("@prisma/client").$Enums.CourseOfferingStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
    }>;
}
