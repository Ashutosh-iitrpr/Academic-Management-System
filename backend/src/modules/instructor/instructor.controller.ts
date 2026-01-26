import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("instructor")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("INSTRUCTOR")
export class InstructorController {
  constructor(private prisma: PrismaService) {}

  // 📝 Get Student Transcript by Entry Number
  @Get("transcript/entry/:entryNumber")
  async getStudentTranscript(@Param("entryNumber") entryNumber: string) {
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
}
