import { Module } from "@nestjs/common";
import { StudentRecordsController } from "./student-records.controller";
import { StudentRecordsService } from "./student-records.service";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  controllers: [StudentRecordsController],
  providers: [StudentRecordsService, PrismaService],
})
export class StudentRecordsModule {}
