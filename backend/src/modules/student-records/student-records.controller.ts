import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { StudentRecordsService } from "./student-records.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Param } from "@nestjs/common"

@Controller("student/record")
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentRecordsController {
  constructor(
    private readonly studentRecordsService: StudentRecordsService,
  ) {}

  @Get()
  getStudentRecord(@Req() req) {
    return this.studentRecordsService.getStudentRecord(
      req.user.userId,
    );
  }

  @Get("transcript-by-type")
  getStudentTranscriptByType(@Req() req) {
    return this.studentRecordsService.getStudentTranscriptByType(
      req.user.userId,
    );
  }

    @Get("semester/:semester")
    getStudentRecordBySemester(
    @Req() req,
    @Param("semester") semester: string,
    ) {
    return this.studentRecordsService.getStudentRecordBySemester(
        req.user.userId,
        semester,
    );
    }

  @Get("transcript")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("STUDENT")
  getTranscript(@Req() req) {
    return this.studentRecordsService.getTranscript(
      req.user.userId,
    );
  }

  @Get("admin/students/:studentId/transcript")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  getStudentTranscriptForAdmin(
    @Param("studentId") studentId: string,
  ) {
    return this.studentRecordsService.getTranscript(studentId);
  }

  @Get("instructor/students/:studentId/transcript")
  @Roles("INSTRUCTOR")
  getStudentTranscriptForInstructor(
    @Param("studentId") studentId: string,
  ) {
    return this.studentRecordsService.getTranscript(studentId);
  }

}
