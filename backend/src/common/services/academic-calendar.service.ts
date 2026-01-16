import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AcademicCalendarService {
  constructor(private prisma: PrismaService) {}

  async getCalendar() {
    const calendar = await this.prisma.academicCalendar.findFirst();

    if (!calendar) {
      throw new BadRequestException(
        "Academic calendar not configured",
      );
    }

    return calendar;
  }

  async assertEnrollmentOpen() {
    const c = await this.getCalendar();
    const now = new Date();

    if (now < c.enrollmentStart || now > c.enrollmentEnd) {
      throw new BadRequestException(
        "Enrollment period is closed",
      );
    }
  }

  async assertDropAllowed() {
    const c = await this.getCalendar();
    if (new Date() > c.dropDeadline) {
      throw new BadRequestException(
        "Drop deadline has passed",
      );
    }
  }

  async assertAuditAllowed() {
    const c = await this.getCalendar();
    if (new Date() > c.auditDeadline) {
      throw new BadRequestException(
        "Audit deadline has passed",
      );
    }
  }
}
