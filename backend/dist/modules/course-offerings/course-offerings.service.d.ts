import { PrismaService } from "../../prisma/prisma.service";
import { RequestOfferingDto } from "./dto/request-offering.dto";
export declare class CourseOfferingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getForStudent(courseCode?: string): Promise<({
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
    getForInstructor(instructorId: string): Promise<({
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
    getAllOfferings(): Promise<({
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
    requestOffering(instructorId: string, dto: RequestOfferingDto): Promise<{
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
    approveOffering(offeringId: string): Promise<{
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
    rejectOffering(offeringId: string): Promise<{
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
    withdrawOffering(offeringId: string): Promise<{
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
    finalizeOffering(instructorId: string, courseOfferingId: string): Promise<{
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
