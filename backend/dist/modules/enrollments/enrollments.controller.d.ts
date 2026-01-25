import { EnrollmentsService } from "./enrollments.service";
import { RequestEnrollmentDto } from "./dto/request-enrollment.dto";
import { CreateEnrollmentTriggerDto } from "./dto/create-enrollment-trigger.dto";
import { UploadGradesDto } from "./dto/upload-grades.dto";
export declare class EnrollmentsController {
    private readonly enrollmentsService;
    constructor(enrollmentsService: EnrollmentsService);
    requestEnrollment(dto: RequestEnrollmentDto, req: any): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        grade: import("@prisma/client").$Enums.Grade | null;
        completedAt: Date | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
        createdAt: Date;
        approvedAt: Date | null;
        studentId: string;
        courseOfferingId: string;
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
        student: {
            name: string;
            email: string;
            entryNumber: string | null;
        };
        courseOffering: {
            course: {
                id: string;
                createdAt: Date;
                name: string;
                code: string;
                credits: number;
                description: string | null;
                ltpsc: string | null;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.CourseOfferingStatus;
            completedAt: Date | null;
            createdAt: Date;
            approvedAt: Date | null;
            courseId: string;
            instructorId: string;
            semester: string;
            timeSlot: string;
            allowedBranches: string[];
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        grade: import("@prisma/client").$Enums.Grade | null;
        completedAt: Date | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
        createdAt: Date;
        approvedAt: Date | null;
        studentId: string;
        courseOfferingId: string;
    })[]>;
    approveEnrollment(id: string, req: any): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        grade: import("@prisma/client").$Enums.Grade | null;
        completedAt: Date | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
        createdAt: Date;
        approvedAt: Date | null;
        studentId: string;
        courseOfferingId: string;
    }>;
    rejectEnrollment(id: string, req: any): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        grade: import("@prisma/client").$Enums.Grade | null;
        completedAt: Date | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
        createdAt: Date;
        approvedAt: Date | null;
        studentId: string;
        courseOfferingId: string;
    }>;
    createEnrollmentTrigger(dto: CreateEnrollmentTriggerDto, req: any): Promise<{
        trigger: {
            id: string;
            enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
            createdAt: Date;
            courseOfferingId: string;
            instructorId: string;
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
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        grade: import("@prisma/client").$Enums.Grade | null;
        completedAt: Date | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
        createdAt: Date;
        approvedAt: Date | null;
        studentId: string;
        courseOfferingId: string;
    })[]>;
    uploadGrades(offeringId: string, dto: UploadGradesDto, req: any): Promise<{
        updatedCount: number;
        updatedEnrollments: string[];
    }>;
    dropEnrollment(id: string, req: any): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        grade: import("@prisma/client").$Enums.Grade | null;
        completedAt: Date | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
        createdAt: Date;
        approvedAt: Date | null;
        studentId: string;
        courseOfferingId: string;
    }>;
    auditEnrollment(id: string, req: any): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        grade: import("@prisma/client").$Enums.Grade | null;
        completedAt: Date | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
        createdAt: Date;
        approvedAt: Date | null;
        studentId: string;
        courseOfferingId: string;
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
                status: import("@prisma/client").$Enums.EnrollmentStatus;
                enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
                grade: import("@prisma/client").$Enums.Grade | null;
                completedAt: Date | null;
                source: import("@prisma/client").$Enums.EnrollmentSource;
                createdAt: Date;
                approvedAt: Date | null;
                studentId: string;
                courseOfferingId: string;
            })[];
            enrolled: ({
                student: {
                    name: string;
                    email: string;
                    entryNumber: string | null;
                };
            } & {
                id: string;
                status: import("@prisma/client").$Enums.EnrollmentStatus;
                enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
                grade: import("@prisma/client").$Enums.Grade | null;
                completedAt: Date | null;
                source: import("@prisma/client").$Enums.EnrollmentSource;
                createdAt: Date;
                approvedAt: Date | null;
                studentId: string;
                courseOfferingId: string;
            })[];
            audit: ({
                student: {
                    name: string;
                    email: string;
                    entryNumber: string | null;
                };
            } & {
                id: string;
                status: import("@prisma/client").$Enums.EnrollmentStatus;
                enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
                grade: import("@prisma/client").$Enums.Grade | null;
                completedAt: Date | null;
                source: import("@prisma/client").$Enums.EnrollmentSource;
                createdAt: Date;
                approvedAt: Date | null;
                studentId: string;
                courseOfferingId: string;
            })[];
            dropped: ({
                student: {
                    name: string;
                    email: string;
                    entryNumber: string | null;
                };
            } & {
                id: string;
                status: import("@prisma/client").$Enums.EnrollmentStatus;
                enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
                grade: import("@prisma/client").$Enums.Grade | null;
                completedAt: Date | null;
                source: import("@prisma/client").$Enums.EnrollmentSource;
                createdAt: Date;
                approvedAt: Date | null;
                studentId: string;
                courseOfferingId: string;
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
