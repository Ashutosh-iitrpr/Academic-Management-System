import { Module } from "@nestjs/common";
import { StudentRecordsController } from "./student-records.controller";
import { StudentRecordsService } from "./student-records.service";
import { PrismaService } from "../../prisma/prisma.service";
import { CommonModule } from "../../common/common.module";

@Module({
  imports: [CommonModule],
  controllers: [StudentRecordsController],
  providers: [StudentRecordsService, PrismaService],
})
export class StudentRecordsModule {}
