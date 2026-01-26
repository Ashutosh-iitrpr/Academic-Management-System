import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UseInterceptors,
  UploadedFile,
  Response,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UpdateUserDto } from "./dto/update-user.dto";

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
    // Validate required fields
    if (!dto.semesterName || !dto.semesterName.trim()) {
      throw new BadRequestException("Semester name is required");
    }

    // Parse and validate dates
    const parseDate = (dateString: string, fieldName: string): Date => {
      if (!dateString) {
        throw new BadRequestException(`${fieldName} is required`);
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new BadRequestException(
          `Invalid ${fieldName} format. Please use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)`
        );
      }
      return date;
    };

    const semesterStartDate = parseDate(dto.semesterStartDate, "Semester start date");
    const semesterEndDate = parseDate(dto.semesterEndDate, "Semester end date");
    const enrollmentStart = parseDate(dto.enrollmentStart, "Enrollment start date");
    const enrollmentEnd = parseDate(dto.enrollmentEnd, "Enrollment end date");
    const dropDeadline = parseDate(dto.dropDeadline, "Drop deadline");
    const auditDeadline = parseDate(dto.auditDeadline, "Audit deadline");

    // Validate date order
    if (semesterStartDate >= semesterEndDate) {
      throw new BadRequestException("Semester start date must be before semester end date");
    }
    if (enrollmentStart >= enrollmentEnd) {
      throw new BadRequestException("Enrollment start date must be before enrollment end date");
    }

    return this.prisma.academicCalendar.create({
      data: {
        semesterName: dto.semesterName.trim(),
        semesterStartDate,
        semesterEndDate,
        enrollmentStart,
        enrollmentEnd,
        dropDeadline,
        auditDeadline,
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

    if (dto.semesterName && dto.semesterName.trim()) {
      data.semesterName = dto.semesterName.trim();
    }

    // Helper function to parse and validate dates
    const parseDate = (dateString: string, fieldName: string): Date => {
      if (!dateString) {
        throw new BadRequestException(`${fieldName} is required`);
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new BadRequestException(
          `Invalid ${fieldName} format. Please use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)`
        );
      }
      return date;
    };

    if (dto.semesterStartDate) data.semesterStartDate = parseDate(dto.semesterStartDate, "Semester start date");
    if (dto.semesterEndDate) data.semesterEndDate = parseDate(dto.semesterEndDate, "Semester end date");
    if (dto.enrollmentStart) data.enrollmentStart = parseDate(dto.enrollmentStart, "Enrollment start date");
    if (dto.enrollmentEnd) data.enrollmentEnd = parseDate(dto.enrollmentEnd, "Enrollment end date");
    if (dto.dropDeadline) data.dropDeadline = parseDate(dto.dropDeadline, "Drop deadline");
    if (dto.auditDeadline) data.auditDeadline = parseDate(dto.auditDeadline, "Audit deadline");

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
        department: true,
        isFacultyAdvisor: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // 📥 Download Students Data as CSV
  @Get("users/download/students")
  async downloadStudentsData(@Response() res: any) {
    const students = await this.prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        name: true,
        email: true,
        entryNumber: true,
      },
      orderBy: { email: "asc" },
    });

    // Create CSV content
    const csvHeaders = ["Name", "Email", "Entry Number"];
    const csvRows = students.map((student) => [
      `"${student.name}"`, // Wrap in quotes to handle commas in names
      student.email,
      student.entryNumber || "",
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    // Set response headers for file download
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="students_' + new Date().toISOString().split("T")[0] + '.csv"'
    );

    res.send(csvContent);
  }

  // 📥 Download Instructors Data as CSV
  @Get("users/download/instructors")
  async downloadInstructorsData(@Response() res: any) {
    const instructors = await this.prisma.user.findMany({
      where: { role: "INSTRUCTOR" },
      select: {
        name: true,
        email: true,
        department: true,
      },
      orderBy: { email: "asc" },
    });

    // Create CSV content
    const csvHeaders = ["Name", "Email", "Department"];
    const csvRows = instructors.map((instructor) => [
      `"${instructor.name}"`, // Wrap in quotes to handle commas in names
      instructor.email,
      instructor.department || "",
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    // Set response headers for file download
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="instructors_' + new Date().toISOString().split("T")[0] + '.csv"'
    );

    res.send(csvContent);
  }

  // ➕ Create User
  @Post("users")
  async createUser(@Body() dto: {
    name: string;
    email: string;
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
    entryNumber?: string;
    department?: string;
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
          department: dto.role === "INSTRUCTOR" ? dto.department : null,
        },
      });
    } catch (error) {
      throw new NotFoundException(
        "User with this email or entry number already exists"
      );
    }
  }

  // 📤 Bulk Upload Users from CSV
  @Post("users/bulk-upload")
  @UseInterceptors(FileInterceptor("file"))
  async bulkUploadUsers(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    if (!file.originalname.endsWith(".csv")) {
      throw new BadRequestException("Only CSV files are accepted");
    }

    try {
      const csvContent = file.buffer.toString("utf-8");
      const lines = csvContent.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        throw new BadRequestException("CSV must contain headers and at least one data row");
      }

      // Parse header
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const nameIndex = headers.indexOf("name");
      const emailIndex = headers.indexOf("email");
      const roleIndex = headers.indexOf("role");
      const entryNumberIndex = headers.indexOf("entrynumber");
      const departmentIndex = headers.indexOf("department");

      if (nameIndex === -1 || emailIndex === -1 || roleIndex === -1) {
        throw new BadRequestException(
          "CSV must contain columns: name, email, role"
        );
      }

      const results: any[] = [];
      let createdCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // Process data rows
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());

        if (values.length < 3) continue;

        const name = values[nameIndex];
        const email = values[emailIndex];
        const role = values[roleIndex]?.toUpperCase();
        const entryNumber = entryNumberIndex >= 0 ? values[entryNumberIndex] : null;
        const department = departmentIndex >= 0 ? values[departmentIndex] : null;

        // Validate required fields
        if (!name || !email || !role) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          failedCount++;
          continue;
        }

        // Validate role
        if (!["STUDENT", "INSTRUCTOR", "ADMIN"].includes(role)) {
          errors.push(`Row ${i + 1}: Invalid role '${role}'`);
          failedCount++;
          continue;
        }

        // Validate student must have entryNumber
        if (role === "STUDENT" && !entryNumber) {
          errors.push(`Row ${i + 1}: Entry number required for students`);
          failedCount++;
          continue;
        }

        // Validate instructor must have department
        if (role === "INSTRUCTOR" && !department) {
          errors.push(`Row ${i + 1}: Department required for instructors`);
          failedCount++;
          continue;
        }

        try {
          await this.prisma.user.create({
            data: {
              name,
              email,
              role: role as "STUDENT" | "INSTRUCTOR" | "ADMIN",
              entryNumber: role === "STUDENT" ? entryNumber : null,
              department: role === "INSTRUCTOR" ? department : null,
            },
          });
          createdCount++;
        } catch (error: any) {
          errors.push(
            `Row ${i + 1}: ${
              error.message.includes("Unique constraint") 
                ? "Email or entry number already exists" 
                : error.message
            }`
          );
          failedCount++;
        }
      }

      return {
        createdCount,
        failedCount,
        totalProcessed: createdCount + failedCount,
        errors: errors.slice(0, 10), // Return first 10 errors
      };
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Error processing CSV file"
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

  // ✏️ Update User (edit name, email, entry number, department)
  @Patch("users/:id")
  async updateUser(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const data: Record<string, any> = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
    }

    if (dto.email !== undefined) {
      data.email = dto.email;
    }

    // Handle entry number - only for students
    if (user.role === "STUDENT") {
      if (dto.entryNumber !== undefined) {
        data.entryNumber = dto.entryNumber;
      }
    } else {
      if (dto.entryNumber !== undefined) {
        throw new BadRequestException("Only students can have entry numbers");
      }
    }

    // Handle department - only for instructors
    if (user.role === "INSTRUCTOR") {
      if (dto.department !== undefined) {
        data.department = dto.department;
      }
      if (dto.isFacultyAdvisor !== undefined) {
        data.isFacultyAdvisor = dto.isFacultyAdvisor;
      }
    } else {
      if (dto.department !== undefined) {
        throw new BadRequestException("Only instructors can have departments");
      }
      if (dto.isFacultyAdvisor !== undefined) {
        throw new BadRequestException("Only instructors can be faculty advisors");
      }
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          entryNumber: true,
          department: true,
          isFacultyAdvisor: true,
          isActive: true,
          createdAt: true,
        },
      });
    } catch (error: any) {
      if (error?.code === "P2002") {
        throw new ConflictException("Email or entry number already in use");
      }
      throw error;
    }
  }

  // 📝 Get Transcript by Entry Number
  @Get("transcript/entry/:entryNumber")
  async getTranscriptByEntry(@Param("entryNumber") entryNumber: string) {
    // Find student by entry number
    const student = await this.prisma.user.findUnique({
      where: { entryNumber },
      select: {
        id: true,
        name: true,
        email: true,
        entryNumber: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with entry number ${entryNumber} not found`);
    }

    // Fetch all enrollments for this student
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: {
        courseOffering: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
                credits: true,
              },
            },
            instructor: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Separate enrollments by type
    const mainDegree = enrollments.filter(e => e.enrollmentType === 'CREDIT');
    const concentration = enrollments.filter(e => e.enrollmentType === 'CREDIT_CONCENTRATION');
    const minor = enrollments.filter(e => e.enrollmentType === 'CREDIT_MINOR');

    // Helper to format enrollments
    const formatEnrollments = (enr: typeof enrollments) => 
      enr.map(e => ({
        id: e.id,
        status: e.status,
        grade: e.grade,
        enrollmentType: e.enrollmentType,
        semester: e.courseOffering?.semester || 'Unknown',
        courseOffering: {
          course: {
            name: e.courseOffering?.course.name || 'Unknown',
            code: e.courseOffering?.course.code || 'Unknown',
            credits: e.courseOffering?.course.credits || 0,
          },
          instructor: {
            name: e.courseOffering?.instructor?.name || 'Unknown',
          },
        },
      }));

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      entrynumber: student.entryNumber,
      mainDegree: formatEnrollments(mainDegree),
      concentration: formatEnrollments(concentration),
      minor: formatEnrollments(minor),
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
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }
}
