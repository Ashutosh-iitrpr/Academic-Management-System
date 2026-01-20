import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminController {
  constructor(private prisma: PrismaService) {}

  // 1️⃣ Create calendar (ONCE)
  @Post("academic-calendar")
  createCalendar(@Body() dto: {
    enrollmentStart: string;
    enrollmentEnd: string;
    dropDeadline: string;
    auditDeadline: string;
  }) {
    return this.prisma.academicCalendar.create({
      data: {
        enrollmentStart: new Date(dto.enrollmentStart),
        enrollmentEnd: new Date(dto.enrollmentEnd),
        dropDeadline: new Date(dto.dropDeadline),
        auditDeadline: new Date(dto.auditDeadline),
      },
    });
  }

  // 2️⃣ Update calendar
  @Patch("academic-calendar")
  updateCalendar(@Body() dto: {
    enrollmentStart: string;
    enrollmentEnd: string;
    dropDeadline: string;
    auditDeadline: string;
  }) {
    return this.prisma.academicCalendar.updateMany({
      data: {
        enrollmentStart: new Date(dto.enrollmentStart),
        enrollmentEnd: new Date(dto.enrollmentEnd),
        dropDeadline: new Date(dto.dropDeadline),
        auditDeadline: new Date(dto.auditDeadline),
      },
    });
  }

  // 3️⃣ View calendar
  @Get("academic-calendar")
  getCalendar() {
    return this.prisma.academicCalendar.findFirst();
  }

  @Get("academic-calendar/student")
    @Roles("STUDENT")
    getCalendarForStudent() {
    return this.prisma.academicCalendar.findFirst({
        select: {
        enrollmentStart: true,
        enrollmentEnd: true,
        dropDeadline: true,
        auditDeadline: true,
        },
    });
    }

    @Get("academic-calendar/instructor")
    @Roles("INSTRUCTOR")
    getCalendarForInstructor() {
    return this.prisma.academicCalendar.findFirst({
        select: {
        enrollmentStart: true,
        enrollmentEnd: true,
        dropDeadline: true,
        auditDeadline: true,
        },
    });
    }

  // 📊 Dashboard Stats - Real data from database
  @Get("dashboard/stats")
  async getDashboardStats() {
    const [totalUsers, totalCourses, pendingApprovals, activeSemesters] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.courseOffering.count({ where: { status: "PENDING" } }),
      this.prisma.academicCalendar.count(),
    ]);

    return {
      totalUsers,
      totalCourses,
      pendingApprovals,
      activeSemesters,
    };
  }

  // 👥 Get All Users (MOCK DATA)
  @Get("users")
  getAllUsers() {
    // TODO: Implement actual user list from database
    return [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        role: "STUDENT",
        entryNumber: "2024CS001",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        role: "INSTRUCTOR",
        entryNumber: null,
        isActive: true,
        createdAt: new Date(),
      },
    ];
  }

  // 📝 Get Transcript by Entry Number (MOCK DATA)
  @Get("transcript/entry/:entryNumber")
  getTranscriptByEntry(@Param("entryNumber") entryNumber: string) {
    // TODO: Implement actual transcript lookup by entry number
    return {
      student: {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        entryNumber: entryNumber,
        branch: "Computer Science",
      },
      cgpa: 8.5,
      totalCredits: 120,
      semesters: [
        {
          semester: "Fall 2024",
          sgpa: 8.7,
          courses: [
            {
              code: "CS101",
              name: "Introduction to Programming",
              credits: 4,
              grade: "A",
            },
            {
              code: "CS102",
              name: "Data Structures",
              credits: 4,
              grade: "A-",
            },
          ],
        },
      ],
    };
  }

  // 📚 Get Course Enrollments
  @Get("courses/:courseId/enrollments")
  async getCourseEnrollments(@Param("courseId") courseId: string) {
    return this.prisma.enrollment.findMany({
      where: {
        courseOffering: {
          courseId: courseId,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            entryNumber: true,
          },
        },
        courseOffering: {
          select: {
            id: true,
            course: {
              select: {
                code: true,
                name: true,
              },
            },
            instructor: {
              select: {
                id: true,
                name: true,
              },
            },
            semester: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // ✏️ Update Course
  @Patch("courses/:courseId")
  async updateCourse(
    @Param("courseId") courseId: string,
    @Body() dto: {
      name?: string;
      code?: string;
      credits?: number;
      description?: string;
    }
  ) {
    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.code && { code: dto.code }),
        ...(dto.credits && { credits: dto.credits }),
      },
    });
  }
}
