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

  // Get the current active semester
  async getCurrentSemester() {
    const calendar = await this.getCalendar();
    const now = new Date();

    // Check if we're within the semester date range
    if (now >= calendar.semesterStartDate && now <= calendar.semesterEndDate) {
      return {
        name: calendar.semesterName,
        startDate: calendar.semesterStartDate,
        endDate: calendar.semesterEndDate,
      };
    }

    // If not, return what the calendar says (system's current semester)
    return {
      name: calendar.semesterName,
      startDate: calendar.semesterStartDate,
      endDate: calendar.semesterEndDate,
    };
  }

  // Get current semester name only
  async getCurrentSemesterName(): Promise<string> {
    const calendar = await this.getCalendar();
    return calendar.semesterName;
  }

  // Check if a given date is within current semester
  async isWithinCurrentSemester(date: Date = new Date()): Promise<boolean> {
    const calendar = await this.getCalendar();
    return date >= calendar.semesterStartDate && date <= calendar.semesterEndDate;
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
