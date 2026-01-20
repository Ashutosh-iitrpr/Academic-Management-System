import { PrismaService } from "../../prisma/prisma.service";
type CourseSummary = {
    courseCode: string;
    courseName: string;
    credits: number;
    enrollmentType: string;
    status: string;
    grade?: string;
    instructor: string;
};
type SemesterBucket = {
    ongoing: CourseSummary[];
    completed: CourseSummary[];
    dropped: CourseSummary[];
    creditsEarned: number;
    creditsRegistered: number;
};
export declare class StudentRecordsService {
    private prisma;
    constructor(prisma: PrismaService);
    getStudentRecord(studentId: string): Promise<{
        student: {
            name: string;
            entryNumber: string;
            branch: string;
            admissionYear: string;
        };
        semesterWiseEnrollments: Record<string, SemesterBucket>;
        summary: {
            cumulativeCreditsCompleted: number;
            creditsOngoing: number;
        };
    }>;
    getStudentRecordBySemester(studentId: string, semester: string): Promise<{
        semester: string;
        message: string;
        courses: {
            ongoing: never[];
            completed: never[];
            dropped: never[];
        };
        summary: {
            creditsEarned: number;
            creditsRegistered: number;
        };
    } | {
        semester: string;
        courses: {
            ongoing: CourseSummary[];
            completed: CourseSummary[];
            dropped: CourseSummary[];
        };
        summary: {
            creditsEarned: number;
            creditsRegistered: number;
        };
        message?: undefined;
    }>;
    getTranscript(studentId: string): Promise<{
        semesters: {
            semester: any;
            courses: any;
            semesterCreditsEarned: any;
            semesterGPA: string;
        }[];
        cumulative: {
            totalCreditsEarned: number;
            CGPA: string;
        };
    }>;
}
export {};
