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
    getPendingForInstructor(instructorId: string): Promise<({
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
    getOfferingEnrollmentsForInstructor(instructorId: string, courseOfferingId: string): Promise<({
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
    approveEnrollment(instructorId: string, enrollmentId: string): Promise<{
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
    rejectEnrollment(instructorId: string, enrollmentId: string): Promise<{
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
    dropEnrollment(studentId: string, enrollmentId: string): Promise<{
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
    auditEnrollment(studentId: string, enrollmentId: string): Promise<{
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
    createEnrollmentTrigger(instructorId: string, dto: CreateEnrollmentTriggerDto): Promise<{
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
    uploadGrades(instructorId: string, courseOfferingId: string, grades: {
        enrollmentId: string;
        grade: Grade;
    }[]): Promise<{
        updatedCount: number;
        updatedEnrollments: string[];
    }>;
}
