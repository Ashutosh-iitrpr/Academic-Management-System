import { Module } from "@nestjs/common";
import { CourseProposalsService } from "./course-proposals.service";
import { CourseProposalsController } from "./course-proposals.controller";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  controllers: [CourseProposalsController],
  providers: [CourseProposalsService, PrismaService],
})
export class CourseProposalsModule {}
