import { EnrollmentsService } from "./enrollments.service";
import { RequestEnrollmentDto } from "./dto/request-enrollment.dto";
import { CreateEnrollmentTriggerDto } from "./dto/create-enrollment-trigger.dto";
import { UploadGradesDto } from "./dto/upload-grades.dto";
import { BulkActionEnrollmentsDto } from "./dto/bulk-action-enrollments.dto";
export declare class EnrollmentsController {
    private readonly enrollmentsService;
    constructor(enrollmentsService: EnrollmentsService);
    requestEnrollment(dto: RequestEnrollmentDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        courseOfferingId: string;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        studentId: string;
        advisorId: string | null;
        grade: import("@prisma/client").$Enums.Grade | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
    }>;
    getMyEnrollments(req: any): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        grade: import("@prisma/client").$Enums.Grade | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
        createdAt: Date;
        approvedAt: Date | null;
        completedAt: Date | null;
        courseOffering: {
            id: string;
            semester: string;
            timeSlot: string;
            status: import("@prisma/client").$Enums.CourseOfferingStatus;
            course: {
                id: string;
                code: string;
                name: string;
                credits: number;
            };
            instructor: {
                name: string;
                email: string;
            };
        };
    }[]>;
    getPendingEnrollments(req: any): Promise<({
        courseOffering: {
            course: {
                name: string;
                id: string;
                createdAt: Date;
                code: string;
                credits: number;
                ltpsc: string | null;
                description: string | null;
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
        };
        student: {
            name: string;
            email: string;
            entryNumber: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        courseOfferingId: string;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        studentId: string;
        advisorId: string | null;
        grade: import("@prisma/client").$Enums.Grade | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
    })[]>;
    approveEnrollment(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        courseOfferingId: string;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        studentId: string;
        advisorId: string | null;
        grade: import("@prisma/client").$Enums.Grade | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
    }>;
    rejectEnrollment(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        courseOfferingId: string;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        studentId: string;
        advisorId: string | null;
        grade: import("@prisma/client").$Enums.Grade | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
    }>;
    bulkActionEnrollments(dto: BulkActionEnrollmentsDto, req: any): Promise<{
        message: string;
        count: number;
        action: "approve" | "reject";
    }>;
    createEnrollmentTrigger(dto: CreateEnrollmentTriggerDto, req: any): Promise<{
        trigger: {
            id: string;
            createdAt: Date;
            instructorId: string;
            courseOfferingId: string;
            enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
            branchCode: string;
            batchYear: number;
        };
        enrolledCount: number;
    }>;
    getOfferingEnrollments(offeringId: string, req: any): Promise<({
        student: {
            name: string;
            email: string;
            entryNumber: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        courseOfferingId: string;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        studentId: string;
        advisorId: string | null;
        grade: import("@prisma/client").$Enums.Grade | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
    })[]>;
    uploadGrades(offeringId: string, dto: UploadGradesDto, req: any): Promise<{
        updatedCount: number;
        updatedEnrollments: string[];
    }>;
    getPendingEnrollmentsForAdvisor(req: any): Promise<({
        courseOffering: {
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
        };
        student: {
            name: string;
            email: string;
            entryNumber: string | null;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        courseOfferingId: string;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        studentId: string;
        advisorId: string | null;
        grade: import("@prisma/client").$Enums.Grade | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
    })[]>;
    approveEnrollmentAsAdvisor(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        courseOfferingId: string;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        studentId: string;
        advisorId: string | null;
        grade: import("@prisma/client").$Enums.Grade | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
    }>;
    rejectEnrollmentAsAdvisor(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        courseOfferingId: string;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        studentId: string;
        advisorId: string | null;
        grade: import("@prisma/client").$Enums.Grade | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
    }>;
    dropEnrollment(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        courseOfferingId: string;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        studentId: string;
        advisorId: string | null;
        grade: import("@prisma/client").$Enums.Grade | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
    }>;
    auditEnrollment(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        approvedAt: Date | null;
        completedAt: Date | null;
        courseOfferingId: string;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        studentId: string;
        advisorId: string | null;
        grade: import("@prisma/client").$Enums.Grade | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
    }>;
    getUnifiedEnrollmentList(offeringId: string, req: any): Promise<{
        viewerRole: string;
        canEdit: boolean;
        canApprove: boolean;
        canTrigger: boolean;
        enrollments: {
            pending: ({
                student: {
                    name: string;
                    email: string;
                    entryNumber: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                status: import("@prisma/client").$Enums.EnrollmentStatus;
                approvedAt: Date | null;
                completedAt: Date | null;
                courseOfferingId: string;
                enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
                studentId: string;
                advisorId: string | null;
                grade: import("@prisma/client").$Enums.Grade | null;
                source: import("@prisma/client").$Enums.EnrollmentSource;
            })[];
            enrolled: ({
                student: {
                    name: string;
                    email: string;
                    entryNumber: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                status: import("@prisma/client").$Enums.EnrollmentStatus;
                approvedAt: Date | null;
                completedAt: Date | null;
                courseOfferingId: string;
                enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
                studentId: string;
                advisorId: string | null;
                grade: import("@prisma/client").$Enums.Grade | null;
                source: import("@prisma/client").$Enums.EnrollmentSource;
            })[];
            audit: ({
                student: {
                    name: string;
                    email: string;
                    entryNumber: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                status: import("@prisma/client").$Enums.EnrollmentStatus;
                approvedAt: Date | null;
                completedAt: Date | null;
                courseOfferingId: string;
                enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
                studentId: string;
                advisorId: string | null;
                grade: import("@prisma/client").$Enums.Grade | null;
                source: import("@prisma/client").$Enums.EnrollmentSource;
            })[];
            dropped: ({
                student: {
                    name: string;
                    email: string;
                    entryNumber: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                status: import("@prisma/client").$Enums.EnrollmentStatus;
                approvedAt: Date | null;
                completedAt: Date | null;
                courseOfferingId: string;
                enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
                studentId: string;
                advisorId: string | null;
                grade: import("@prisma/client").$Enums.Grade | null;
                source: import("@prisma/client").$Enums.EnrollmentSource;
            })[];
        };
        stats: {
            pending: number;
            enrolled: number;
            audit: number;
            dropped: number;
        };
    }>;
}
