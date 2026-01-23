import { PrismaService } from "../../prisma/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";
export declare class AdminController {
    private prisma;
    constructor(prisma: PrismaService);
    createCalendar(dto: {
        semesterName: string;
        semesterStartDate: string;
        semesterEndDate: string;
        enrollmentStart: string;
        enrollmentEnd: string;
        dropDeadline: string;
        auditDeadline: string;
    }): import("@prisma/client").Prisma.Prisma__AcademicCalendarClient<{
        id: string;
        createdAt: Date;
        semesterName: string;
        semesterStartDate: Date;
        semesterEndDate: Date;
        enrollmentStart: Date;
        enrollmentEnd: Date;
        dropDeadline: Date;
        auditDeadline: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateCalendar(dto: {
        semesterName?: string;
        semesterStartDate?: string;
        semesterEndDate?: string;
        enrollmentStart?: string;
        enrollmentEnd?: string;
        dropDeadline?: string;
        auditDeadline?: string;
    }): import("@prisma/client").Prisma.PrismaPromise<import("@prisma/client").Prisma.BatchPayload>;
    getCalendar(): import("@prisma/client").Prisma.Prisma__AcademicCalendarClient<{
        id: string;
        createdAt: Date;
        semesterName: string;
        semesterStartDate: Date;
        semesterEndDate: Date;
        enrollmentStart: Date;
        enrollmentEnd: Date;
        dropDeadline: Date;
        auditDeadline: Date;
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
    getAllUsers(): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        entryNumber: string | null;
        department: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    createUser(dto: {
        name: string;
        email: string;
        role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
        entryNumber?: string;
        department?: string;
    }): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        entryNumber: string | null;
        department: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    bulkUploadUsers(file: any): Promise<{
        createdCount: number;
        failedCount: number;
        totalProcessed: number;
        errors: string[];
    }>;
    deactivateUser(id: string): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        entryNumber: string | null;
        department: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    activateUser(id: string): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        entryNumber: string | null;
        department: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    updateUser(id: string, dto: UpdateUserDto): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        entryNumber: string | null;
        department: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }>;
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
        courseOffering: {
            course: {
                name: string;
                code: string;
            };
            id: string;
            semester: string;
            instructor: {
                name: string;
                id: string;
            };
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
        studentId: string;
        enrollmentType: import("@prisma/client").$Enums.EnrollmentType;
        grade: import("@prisma/client").$Enums.Grade | null;
        source: import("@prisma/client").$Enums.EnrollmentSource;
    })[]>;
    updateCourse(courseId: string, dto: {
        name?: string;
        code?: string;
        credits?: number;
        description?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        code: string;
        credits: number;
        description: string | null;
    }>;
}
