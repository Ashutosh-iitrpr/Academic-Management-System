import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  NotFoundException,
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
    semesterName: string;
    semesterStartDate: string;
    semesterEndDate: string;
    enrollmentStart: string;
    enrollmentEnd: string;
    dropDeadline: string;
    auditDeadline: string;
  }) {
    return this.prisma.academicCalendar.create({
      data: {
        semesterName: dto.semesterName,
        semesterStartDate: new Date(dto.semesterStartDate),
        semesterEndDate: new Date(dto.semesterEndDate),
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
    semesterName?: string;
    semesterStartDate?: string;
    semesterEndDate?: string;
    enrollmentStart?: string;
    enrollmentEnd?: string;
    dropDeadline?: string;
    auditDeadline?: string;
  }) {
    const data: any = {};
    if (dto.semesterName) data.semesterName = dto.semesterName;
    if (dto.semesterStartDate) data.semesterStartDate = new Date(dto.semesterStartDate);
    if (dto.semesterEndDate) data.semesterEndDate = new Date(dto.semesterEndDate);
    if (dto.enrollmentStart) data.enrollmentStart = new Date(dto.enrollmentStart);
    if (dto.enrollmentEnd) data.enrollmentEnd = new Date(dto.enrollmentEnd);
    if (dto.dropDeadline) data.dropDeadline = new Date(dto.dropDeadline);
    if (dto.auditDeadline) data.auditDeadline = new Date(dto.auditDeadline);

    return this.prisma.academicCalendar.updateMany({
      data,
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

  // 👥 Get All Users from Database
  @Get("users")
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        entryNumber: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ➕ Create User
  @Post("users")
  async createUser(@Body() dto: {
    name: string;
    email: string;
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
    entryNumber?: string;
  }) {
    // Validate student must have entryNumber
    if (dto.role === "STUDENT" && !dto.entryNumber) {
      throw new NotFoundException("Entry number is required for students");
    }

    // Non-students must NOT have entryNumber
    if (dto.role !== "STUDENT" && dto.entryNumber) {
      throw new NotFoundException("Only students can have entry numbers");
    }

    try {
      return await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          role: dto.role,
          entryNumber: dto.role === "STUDENT" ? dto.entryNumber : null,
        },
      });
    } catch (error) {
      throw new NotFoundException(
        "User with this email or entry number already exists"
      );
    }
  }

  // 🔒 Deactivate User
  @Patch("users/:id/deactivate")
  async deactivateUser(@Param("id") id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ✅ Activate User
  @Patch("users/:id/activate")
  async activateUser(@Param("id") id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
  }

  // 📝 Get Transcript by Entry Number
  @Get("transcript/entry/:entryNumber")
  async getTranscriptByEntry(@Param("entryNumber") entryNumber: string) {
    const student = await this.prisma.user.findFirst({
      where: {
        entryNumber: entryNumber,
        role: 'STUDENT',
      },
      include: {
        enrollments: {
          include: {
            courseOffering: {
              include: {
                course: true,
                instructor: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found with this entry number');
    }

    return student;
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
