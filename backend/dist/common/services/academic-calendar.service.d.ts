import { PrismaService } from "../../prisma/prisma.service";
export declare class AcademicCalendarService {
    private prisma;
    constructor(prisma: PrismaService);
    getCalendar(): Promise<{
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
    }>;
    getCurrentSemester(): Promise<{
        name: string;
        startDate: Date;
        endDate: Date;
    }>;
    getCurrentSemesterName(): Promise<string>;
    isWithinCurrentSemester(date?: Date): Promise<boolean>;
    assertEnrollmentOpen(): Promise<void>;
    assertDropAllowed(): Promise<void>;
    assertAuditAllowed(): Promise<void>;
}
