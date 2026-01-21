import { PrismaService } from "../../prisma/prisma.service";
import { Grade } from "@prisma/client";
import { RequestEnrollmentDto } from "./dto/request-enrollment.dto";
import { CreateEnrollmentTriggerDto } from "./dto/create-enrollment-trigger.dto";
import { AcademicCalendarService } from "src/common/services/academic-calendar.service";
export declare class EnrollmentsService {
    private prisma;
    private academicCalendarService;
    constructor(prisma: PrismaService, academicCalendarService: AcademicCalendarService);
    requestEnrollment(studentId: string, dto: RequestEnrollmentDto): Promise<{
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
    }>;
    getPendingForInstructor(instructorId: string): Promise<({
        courseOffering: {
            course: {
                name: string;
                id: string;
                createdAt: Date;
                code: string;
                credits: number;
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
        grade: import("@prisma/client").$Enums.Grade | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
    })[]>;
    getOfferingEnrollmentsForInstructor(instructorId: string, courseOfferingId: string): Promise<({
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
        grade: import("@prisma/client").$Enums.Grade | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
    })[]>;
    approveEnrollment(instructorId: string, enrollmentId: string): Promise<{
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
    }>;
    rejectEnrollment(instructorId: string, enrollmentId: string): Promise<{
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
    }>;
    dropEnrollment(studentId: string, enrollmentId: string): Promise<{
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
    }>;
    auditEnrollment(studentId: string, enrollmentId: string): Promise<{
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
    }>;
    createEnrollmentTrigger(instructorId: string, dto: CreateEnrollmentTriggerDto): Promise<{
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
    getStudentEnrollments(studentId: string): Promise<{
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
    getUnifiedEnrollmentList(viewer: {
        userId: string;
        role: string;
    }, courseOfferingId: string): Promise<{
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
    uploadGrades(instructorId: string, courseOfferingId: string, grades: {
        enrollmentId: string;
        grade: Grade;
    }[]): Promise<{
        updatedCount: number;
        updatedEnrollments: string[];
    }>;
}
