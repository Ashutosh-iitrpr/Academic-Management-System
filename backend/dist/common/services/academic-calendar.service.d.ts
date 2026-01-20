import { PrismaService } from "../../prisma/prisma.service";
export declare class AcademicCalendarService {
    private prisma;
    constructor(prisma: PrismaService);
    getCalendar(): Promise<{
        id: string;
        createdAt: Date;
        enrollmentStart: Date;
        enrollmentEnd: Date;
        dropDeadline: Date;
        auditDeadline: Date;
        updatedAt: Date;
    }>;
    assertEnrollmentOpen(): Promise<void>;
    assertDropAllowed(): Promise<void>;
    assertAuditAllowed(): Promise<void>;
}
