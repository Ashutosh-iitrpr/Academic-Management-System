import { PrismaService } from "../../prisma/prisma.service";
export declare class AdminController {
    private prisma;
    constructor(prisma: PrismaService);
    createCalendar(dto: {
        enrollmentStart: string;
        enrollmentEnd: string;
        dropDeadline: string;
        auditDeadline: string;
    }): import("@prisma/client").Prisma.Prisma__AcademicCalendarClient<{
        id: string;
        enrollmentStart: Date;
        enrollmentEnd: Date;
        dropDeadline: Date;
        auditDeadline: Date;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateCalendar(dto: {
        enrollmentStart: string;
        enrollmentEnd: string;
        dropDeadline: string;
        auditDeadline: string;
    }): import("@prisma/client").Prisma.PrismaPromise<import("@prisma/client").Prisma.BatchPayload>;
    getCalendar(): import("@prisma/client").Prisma.Prisma__AcademicCalendarClient<{
        id: string;
        enrollmentStart: Date;
        enrollmentEnd: Date;
        dropDeadline: Date;
        auditDeadline: Date;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getCalendarForStudent(): import("@prisma/client").Prisma.Prisma__AcademicCalendarClient<{
        enrollmentStart: Date;
        enrollmentEnd: Date;
        dropDeadline: Date;
        auditDeadline: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getCalendarForInstructor(): import("@prisma/client").Prisma.Prisma__AcademicCalendarClient<{
        enrollmentStart: Date;
        enrollmentEnd: Date;
        dropDeadline: Date;
        auditDeadline: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalCourses: number;
        pendingApprovals: number;
        activeSemesters: number;
    }>;
    getAllUsers(): ({
        id: string;
        name: string;
        email: string;
        role: string;
        entryNumber: string;
        isActive: boolean;
        createdAt: Date;
    } | {
        id: string;
        name: string;
        email: string;
        role: string;
        entryNumber: null;
        isActive: boolean;
        createdAt: Date;
    })[];
    getTranscriptByEntry(entryNumber: string): {
        student: {
            id: string;
            name: string;
            email: string;
            entryNumber: string;
            branch: string;
        };
        cgpa: number;
        totalCredits: number;
        semesters: {
            semester: string;
            sgpa: number;
            courses: {
                code: string;
                name: string;
                credits: number;
                grade: string;
            }[];
        }[];
    };
    getCourseEnrollments(courseId: string): Promise<({
        student: {
            id: string;
            name: string;
            email: string;
            entryNumber: string | null;
        };
        courseOffering: {
            id: string;
            semester: string;
            course: {
                name: string;
                code: string;
            };
            instructor: {
                id: string;
                name: string;
            };
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        studentId: string;
        courseOfferingId: string;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        grade: import("@prisma/client").$Enums.Grade | null;
        completedAt: Date | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
        approvedAt: Date | null;
    })[]>;
    updateCourse(courseId: string, dto: {
        name?: string;
        code?: string;
        credits?: number;
        description?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        code: string;
        credits: number;
    }>;
}
