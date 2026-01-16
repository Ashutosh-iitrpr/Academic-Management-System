import {
  Body,
  Controller,
  Get,
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


}
