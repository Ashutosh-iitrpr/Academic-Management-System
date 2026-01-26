import { PrismaService } from "../../prisma/prisma.service";
import { RequestOfferingDto } from "./dto/request-offering.dto";
export declare class CourseOfferingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getForStudent(courseCode?: string): Promise<({
        course: {
            name: string;
            id: string;
            createdAt: Date;
            code: string;
            credits: number;
            ltpsc: string | null;
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
    getForInstructor(instructorId: string): Promise<({
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
    getAllOfferings(): Promise<({
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
    requestOffering(instructorId: string, dto: RequestOfferingDto): Promise<{
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
    getPendingOfferings(): Promise<({
        course: {
            name: string;
            id: string;
            createdAt: Date;
            code: string;
            credits: number;
            ltpsc: string | null;
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
    approveOffering(offeringId: string): Promise<{
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
    rejectOffering(offeringId: string): Promise<{
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
    withdrawOffering(offeringId: string): Promise<{
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
    finalizeOffering(instructorId: string, courseOfferingId: string): Promise<{
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
