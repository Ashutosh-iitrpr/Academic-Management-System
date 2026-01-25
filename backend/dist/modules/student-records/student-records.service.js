"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRecordsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const grades_constants_1 = require("../../constants/grades.constants");
const academic_calendar_service_1 = require("../../common/services/academic-calendar.service");
let StudentRecordsService = class StudentRecordsService {
    prisma;
    academicCalendarService;
    constructor(prisma, academicCalendarService) {
        this.prisma = prisma;
        this.academicCalendarService = academicCalendarService;
    }
    async getStudentRecord(studentId) {
        const student = await this.prisma.user.findUnique({
            where: { id: studentId },
        });
        if (!student || !student.entryNumber) {
            throw new common_1.NotFoundException("Student not found");
        }
        const admissionYear = student.entryNumber.slice(0, 4);
        const branch = student.entryNumber.slice(4, 7);
        const enrollments = await this.prisma.enrollment.findMany({
            where: { studentId },
            include: {
                courseOffering: {
                    include: {
                        course: true,
                        instructor: {
                            select: { name: true },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        const semesterWiseEnrollments = {};
        let cumulativeCreditsCompleted = 0;
        let creditsOngoing = 0;
        let mainGradePoints = 0;
        let mainCreditsAttempted = 0;
        let mainCreditsEarned = 0;
        let concentrationGradePoints = 0;
        let concentrationCreditsAttempted = 0;
        let concentrationCreditsEarned = 0;
        let minorGradePoints = 0;
        let minorCreditsAttempted = 0;
        let minorCreditsEarned = 0;
        let currentSemesterMainGradePoints = 0;
        let currentSemesterMainCreditsEarned = 0;
        let currentSemesterCredits = 0;
        const allSemesters = [...new Set(enrollments.map(e => e.courseOffering.semester))];
        const currentSemesterName = await this.academicCalendarService.getCurrentSemesterName();
        const currentSemester = allSemesters.includes(currentSemesterName)
            ? currentSemesterName
            : allSemesters[allSemesters.length - 1] || currentSemesterName;
        for (const e of enrollments) {
            const semester = e.courseOffering.semester;
            const course = e.courseOffering.course;
            const grade = e.grade;
            if (!semesterWiseEnrollments[semester]) {
                semesterWiseEnrollments[semester] = {
                    ongoing: [],
                    completed: [],
                    dropped: [],
                    creditsEarned: 0,
                    creditsRegistered: 0,
                };
            }
            const courseSummary = {
                courseCode: course.code,
                courseName: course.name,
                credits: course.credits,
                enrollmentType: e.enrollmentType,
                status: e.status,
                grade: e.grade ?? undefined,
                instructor: e.courseOffering.instructor.name,
            };
            if (e.status === client_1.EnrollmentStatus.COMPLETED) {
                semesterWiseEnrollments[semester].completed.push(courseSummary);
                semesterWiseEnrollments[semester].creditsEarned += course.credits;
                cumulativeCreditsCompleted += course.credits;
                const gradePoints = grades_constants_1.GRADE_POINTS[grade] ?? 0;
                if (e.enrollmentType === 'CREDIT') {
                    mainGradePoints += gradePoints * course.credits;
                    mainCreditsAttempted += course.credits;
                    mainCreditsEarned += course.credits;
                    if (semester === currentSemester) {
                        currentSemesterMainGradePoints += gradePoints * course.credits;
                        currentSemesterMainCreditsEarned += course.credits;
                    }
                }
                else if (e.enrollmentType === 'CREDIT_CONCENTRATION') {
                    concentrationGradePoints += gradePoints * course.credits;
                    concentrationCreditsAttempted += course.credits;
                    concentrationCreditsEarned += course.credits;
                }
                else if (e.enrollmentType === 'CREDIT_MINOR') {
                    minorGradePoints += gradePoints * course.credits;
                    minorCreditsAttempted += course.credits;
                    minorCreditsEarned += course.credits;
                }
            }
            if (e.status === client_1.EnrollmentStatus.ENROLLED ||
                e.status === client_1.EnrollmentStatus.AUDIT) {
                semesterWiseEnrollments[semester].ongoing.push(courseSummary);
                semesterWiseEnrollments[semester].creditsRegistered += course.credits;
                creditsOngoing += course.credits;
                if (semester === currentSemester && e.status !== client_1.EnrollmentStatus.AUDIT) {
                    currentSemesterCredits += course.credits;
                }
            }
            if (e.status === client_1.EnrollmentStatus.DROPPED) {
                semesterWiseEnrollments[semester].dropped.push(courseSummary);
            }
        }
        const cgpa = mainCreditsAttempted > 0
            ? parseFloat((mainGradePoints / mainCreditsAttempted).toFixed(2))
            : 0;
        const currentSemesterGPA = currentSemesterMainCreditsEarned > 0
            ? parseFloat((currentSemesterMainGradePoints / currentSemesterMainCreditsEarned).toFixed(2))
            : 0;
        const concentrationGPA = concentrationCreditsAttempted > 0
            ? parseFloat((concentrationGradePoints / concentrationCreditsAttempted).toFixed(2))
            : 0;
        const minorGPA = minorCreditsAttempted > 0
            ? parseFloat((minorGradePoints / minorCreditsAttempted).toFixed(2))
            : 0;
        return {
            student: {
                name: student.name,
                entryNumber: student.entryNumber,
                branch,
                admissionYear,
            },
            semesterWiseEnrollments,
            summary: {
                cumulativeCreditsCompleted,
                creditsOngoing,
                totalEnrollments: enrollments.length,
                mainGPA: cgpa,
                concentrationGPA,
                minorGPA,
                cgpa,
                currentSemesterGPA,
            },
        };
    }
    async getStudentRecordBySemester(studentId, semester) {
        const student = await this.prisma.user.findUnique({
            where: { id: studentId },
        });
        if (!student || !student.entryNumber) {
            throw new common_1.NotFoundException("Student not found");
        }
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                studentId,
                courseOffering: { semester },
            },
            include: {
                courseOffering: {
                    include: {
                        course: true,
                        instructor: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });
        if (enrollments.length === 0) {
            return {
                semester,
                message: "No enrollments found for this semester",
                courses: {
                    ongoing: [],
                    completed: [],
                    dropped: [],
                },
                summary: {
                    creditsEarned: 0,
                    creditsRegistered: 0,
                },
            };
        }
        const courses = {
            ongoing: [],
            completed: [],
            dropped: [],
        };
        let creditsEarned = 0;
        let creditsRegistered = 0;
        for (const e of enrollments) {
            const course = e.courseOffering.course;
            const courseSummary = {
                courseCode: course.code,
                courseName: course.name,
                credits: course.credits,
                enrollmentType: e.enrollmentType,
                status: e.status,
                grade: e.grade ?? undefined,
                instructor: e.courseOffering.instructor.name,
            };
            if (e.status === client_1.EnrollmentStatus.COMPLETED) {
                courses.completed.push(courseSummary);
                creditsEarned += course.credits;
            }
            if (e.status === client_1.EnrollmentStatus.ENROLLED ||
                e.status === client_1.EnrollmentStatus.AUDIT) {
                courses.ongoing.push(courseSummary);
                creditsRegistered += course.credits;
            }
            if (e.status === client_1.EnrollmentStatus.DROPPED) {
                courses.dropped.push(courseSummary);
            }
        }
        return {
            semester,
            courses,
            summary: {
                creditsEarned,
                creditsRegistered,
            },
        };
    }
    async getTranscript(studentId) {
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                studentId,
                status: client_1.EnrollmentStatus.COMPLETED,
            },
            include: {
                courseOffering: {
                    include: {
                        course: true,
                    },
                },
            },
            orderBy: {
                courseOffering: {
                    semester: "asc",
                },
            },
        });
        const semesterMap = {};
        let mainGradePoints = 0;
        let mainCreditsAttempted = 0;
        let mainCreditsEarned = 0;
        let concentrationGradePoints = 0;
        let concentrationCreditsAttempted = 0;
        let concentrationCreditsEarned = 0;
        let minorGradePoints = 0;
        let minorCreditsAttempted = 0;
        let minorCreditsEarned = 0;
        for (const e of enrollments) {
            const semester = e.courseOffering.semester;
            const course = e.courseOffering.course;
            const grade = e.grade;
            const gradePoints = grades_constants_1.GRADE_POINTS[grade] ?? 0;
            const credits = course.credits;
            if (!semesterMap[semester]) {
                semesterMap[semester] = {
                    semester,
                    courses: [],
                    mainTotalGradePoints: 0,
                    mainTotalCredits: 0,
                    mainCreditsEarned: 0,
                    concentrationTotalGradePoints: 0,
                    concentrationTotalCredits: 0,
                    concentrationCreditsEarned: 0,
                    minorTotalGradePoints: 0,
                    minorTotalCredits: 0,
                    minorCreditsEarned: 0,
                };
            }
            semesterMap[semester].courses.push({
                courseCode: course.code,
                courseName: course.name,
                credits,
                grade,
                gradePoints,
                enrollmentType: e.enrollmentType,
            });
            if (e.enrollmentType === 'CREDIT') {
                semesterMap[semester].mainTotalGradePoints += gradePoints * credits;
                semesterMap[semester].mainTotalCredits += credits;
                mainGradePoints += gradePoints * credits;
                mainCreditsAttempted += credits;
                if (gradePoints > 0) {
                    semesterMap[semester].mainCreditsEarned += credits;
                    mainCreditsEarned += credits;
                }
            }
            else if (e.enrollmentType === 'CREDIT_CONCENTRATION') {
                semesterMap[semester].concentrationTotalGradePoints += gradePoints * credits;
                semesterMap[semester].concentrationTotalCredits += credits;
                concentrationGradePoints += gradePoints * credits;
                concentrationCreditsAttempted += credits;
                if (gradePoints > 0) {
                    semesterMap[semester].concentrationCreditsEarned += credits;
                    concentrationCreditsEarned += credits;
                }
            }
            else if (e.enrollmentType === 'CREDIT_MINOR') {
                semesterMap[semester].minorTotalGradePoints += gradePoints * credits;
                semesterMap[semester].minorTotalCredits += credits;
                minorGradePoints += gradePoints * credits;
                minorCreditsAttempted += credits;
                if (gradePoints > 0) {
                    semesterMap[semester].minorCreditsEarned += credits;
                    minorCreditsEarned += credits;
                }
            }
        }
        const semesters = Object.values(semesterMap).map((s) => ({
            semester: s.semester,
            courses: s.courses,
            main: {
                semesterCreditsEarned: s.mainCreditsEarned,
                semesterGPA: s.mainTotalCredits > 0
                    ? (s.mainTotalGradePoints / s.mainTotalCredits).toFixed(2)
                    : "0.00",
            },
            concentration: {
                semesterCreditsEarned: s.concentrationCreditsEarned,
                semesterGPA: s.concentrationTotalCredits > 0
                    ? (s.concentrationTotalGradePoints / s.concentrationTotalCredits).toFixed(2)
                    : "0.00",
            },
            minor: {
                semesterCreditsEarned: s.minorCreditsEarned,
                semesterGPA: s.minorTotalCredits > 0
                    ? (s.minorTotalGradePoints / s.minorTotalCredits).toFixed(2)
                    : "0.00",
            },
        }));
        const mainCGPA = mainCreditsAttempted > 0
            ? (mainGradePoints / mainCreditsAttempted).toFixed(2)
            : "0.00";
        const concentrationCGPA = concentrationCreditsAttempted > 0
            ? (concentrationGradePoints / concentrationCreditsAttempted).toFixed(2)
            : "0.00";
        const minorCGPA = minorCreditsAttempted > 0
            ? (minorGradePoints / minorCreditsAttempted).toFixed(2)
            : "0.00";
        return {
            semesters,
            cumulative: {
                main: {
                    totalCreditsEarned: mainCreditsEarned,
                    CGPA: mainCGPA,
                },
                concentration: {
                    totalCreditsEarned: concentrationCreditsEarned,
                    CGPA: concentrationCGPA,
                },
                minor: {
                    totalCreditsEarned: minorCreditsEarned,
                    CGPA: minorCGPA,
                },
            },
        };
    }
};
exports.StudentRecordsService = StudentRecordsService;
exports.StudentRecordsService = StudentRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        academic_calendar_service_1.AcademicCalendarService])
], StudentRecordsService);
//# sourceMappingURL=student-records.service.js.map