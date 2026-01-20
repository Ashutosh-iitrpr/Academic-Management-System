import { Module } from "@nestjs/common";
import { CourseOfferingsService } from "./course-offerings.service";
import { CourseOfferingsController } from "./course-offerings.controller";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  controllers: [CourseOfferingsController],
  providers: [CourseOfferingsService, PrismaService],
})
export class CourseOfferingsModule {}
