import { PrismaService } from "../../prisma/prisma.service";
import { AcademicCalendarService } from "src/common/services/academic-calendar.service";
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
    private academicCalendarService;
    constructor(prisma: PrismaService, academicCalendarService: AcademicCalendarService);
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
            totalEnrollments: number;
            mainGPA: number;
            concentrationGPA: number;
            minorGPA: number;
            cgpa: number;
            currentSemesterGPA: number;
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
            main: {
                semesterCreditsEarned: any;
                semesterGPA: string;
            };
            concentration: {
                semesterCreditsEarned: any;
                semesterGPA: string;
            };
            minor: {
                semesterCreditsEarned: any;
                semesterGPA: string;
            };
        }[];
        cumulative: {
            main: {
                totalCreditsEarned: number;
                CGPA: string;
            };
            concentration: {
                totalCreditsEarned: number;
                CGPA: string;
            };
            minor: {
                totalCreditsEarned: number;
                CGPA: string;
            };
        };
    }>;
}
export {};
