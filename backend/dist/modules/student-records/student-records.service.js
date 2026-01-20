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
let StudentRecordsService = class StudentRecordsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
        for (const e of enrollments) {
            const semester = e.courseOffering.semester;
            const course = e.courseOffering.course;
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
            }
            if (e.status === client_1.EnrollmentStatus.ENROLLED ||
                e.status === client_1.EnrollmentStatus.AUDIT) {
                semesterWiseEnrollments[semester].ongoing.push(courseSummary);
                semesterWiseEnrollments[semester].creditsRegistered += course.credits;
                creditsOngoing += course.credits;
            }
            if (e.status === client_1.EnrollmentStatus.DROPPED) {
                semesterWiseEnrollments[semester].dropped.push(courseSummary);
            }
        }
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
        let totalGradePoints = 0;
        let totalCreditsAttempted = 0;
        let totalCreditsEarned = 0;
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
                    totalGradePoints: 0,
                    totalCredits: 0,
                    creditsEarned: 0,
                };
            }
            semesterMap[semester].courses.push({
                courseCode: course.code,
                courseName: course.name,
                credits,
                grade,
                gradePoints,
            });
            semesterMap[semester].totalGradePoints +=
                gradePoints * credits;
            semesterMap[semester].totalCredits += credits;
            totalGradePoints += gradePoints * credits;
            totalCreditsAttempted += credits;
            if (gradePoints > 0) {
                semesterMap[semester].creditsEarned += credits;
                totalCreditsEarned += credits;
            }
        }
        const semesters = Object.values(semesterMap).map((s) => ({
            semester: s.semester,
            courses: s.courses,
            semesterCreditsEarned: s.creditsEarned,
            semesterGPA: s.totalCredits > 0
                ? (s.totalGradePoints / s.totalCredits).toFixed(2)
                : "0.00",
        }));
        const CGPA = totalCreditsAttempted > 0
            ? (totalGradePoints / totalCreditsAttempted).toFixed(2)
            : "0.00";
        return {
            semesters,
            cumulative: {
                totalCreditsEarned,
                CGPA,
            },
        };
    }
};
exports.StudentRecordsService = StudentRecordsService;
exports.StudentRecordsService = StudentRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentRecordsService);
//# sourceMappingURL=student-records.service.js.map