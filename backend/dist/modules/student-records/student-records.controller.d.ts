import { StudentRecordsService } from "./student-records.service";
export declare class StudentRecordsController {
    private readonly studentRecordsService;
    constructor(studentRecordsService: StudentRecordsService);
    getStudentRecord(req: any): Promise<{
        student: {
            name: string;
            entryNumber: string;
            branch: string;
            admissionYear: string;
        };
        semesterWiseEnrollments: Record<string, {
            ongoing: {
                courseCode: string;
                courseName: string;
                credits: number;
                enrollmentType: string;
                status: string;
                grade?: string;
                instructor: string;
            }[];
            completed: {
                courseCode: string;
                courseName: string;
                credits: number;
                enrollmentType: string;
                status: string;
                grade?: string;
                instructor: string;
            }[];
            dropped: {
                courseCode: string;
                courseName: string;
                credits: number;
                enrollmentType: string;
                status: string;
                grade?: string;
                instructor: string;
            }[];
            creditsEarned: number;
            creditsRegistered: number;
        }>;
        summary: {
            cumulativeCreditsCompleted: number;
            creditsOngoing: number;
        };
    }>;
    getStudentRecordBySemester(req: any, semester: string): Promise<{
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
            ongoing: {
                courseCode: string;
                courseName: string;
                credits: number;
                enrollmentType: string;
                status: string;
                grade?: string;
                instructor: string;
            }[];
            completed: {
                courseCode: string;
                courseName: string;
                credits: number;
                enrollmentType: string;
                status: string;
                grade?: string;
                instructor: string;
            }[];
            dropped: {
                courseCode: string;
                courseName: string;
                credits: number;
                enrollmentType: string;
                status: string;
                grade?: string;
                instructor: string;
            }[];
        };
        summary: {
            creditsEarned: number;
            creditsRegistered: number;
        };
        message?: undefined;
    }>;
    getTranscript(req: any): Promise<{
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
    getStudentTranscriptForAdmin(studentId: string): Promise<{
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
    getStudentTranscriptForInstructor(studentId: string): Promise<{
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
