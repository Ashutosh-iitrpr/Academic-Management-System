import { Module } from "@nestjs/common";
import { EnrollmentsController } from "./enrollments.controller";
import { EnrollmentsService } from "./enrollments.service";
import { PrismaService } from "../../prisma/prisma.service";
import { CommonModule } from "../../common/common.module";

@Module({
  imports: [
    CommonModule,   // ✅ THIS IS THE FIX
  ],
  controllers: [EnrollmentsController],
  providers: [
    EnrollmentsService,
    PrismaService,
  ],
})
export class EnrollmentsModule {}
