import { Module } from "@nestjs/common";
import { InstructorController } from "./instructor.controller";
import { CommonModule } from "../../common/common.module";

@Module({
  imports: [CommonModule],
  controllers: [InstructorController],
})
export class InstructorModule {}
