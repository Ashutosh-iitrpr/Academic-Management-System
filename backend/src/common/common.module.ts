import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AcademicCalendarService } from "./services/academic-calendar.service";

@Module({
  providers: [
    PrismaService,
    AcademicCalendarService,
  ],
  exports: [
    PrismaService,
    AcademicCalendarService,
  ],
})
export class CommonModule {}
