import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { EnrollmentsService } from "./enrollments.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { RequestEnrollmentDto } from "./dto/request-enrollment.dto";
import { CreateEnrollmentTriggerDto } from "./dto/create-enrollment-trigger.dto";
import { UploadGradesDto } from "./dto/upload-grades.dto";

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  // ---------- STUDENT ----------
  @Post("student/enrollments")
  @Roles("STUDENT")
  requestEnrollment(
    @Body() dto: RequestEnrollmentDto,
    @Req() req,
  ) {
    return this.enrollmentsService.requestEnrollment(
      req.user.userId,
      dto,
    );
  }

  @Get("student/enrollments")
  @Roles("STUDENT")
  getMyEnrollments(@Req() req) {
    return this.enrollmentsService.getStudentEnrollments(
      req.user.userId,
    );
  }

  // ---------- INSTRUCTOR ----------
  @Get("instructor/enrollments/pending")
  @Roles("INSTRUCTOR")
  getPendingEnrollments(@Req() req) {
    return this.enrollmentsService.getPendingForInstructor(
      req.user.userId,
    );
  }

  @Patch("instructor/enrollments/:id/approve")
  @Roles("INSTRUCTOR")
  approveEnrollment(
    @Param("id") id: string,
    @Req() req,
  ) {
    return this.enrollmentsService.approveEnrollment(
      req.user.userId,
      id,
    );
  }

  @Patch("instructor/enrollments/:id/reject")
  @Roles("INSTRUCTOR")
  rejectEnrollment(
    @Param("id") id: string,
    @Req() req,
  ) {
    return this.enrollmentsService.rejectEnrollment(
      req.user.userId,
      id,
    );
  }

  @Post("instructor/enrollments/triggers")
  @Roles("INSTRUCTOR")
  createEnrollmentTrigger(
    @Body() dto: CreateEnrollmentTriggerDto,
    @Req() req,
  ) {
    return this.enrollmentsService.createEnrollmentTrigger(
      req.user.userId,
      dto,
    );
  }

  @Get("instructor/course-offerings/:id/enrollments")
  @Roles("INSTRUCTOR")
  getOfferingEnrollments(
    @Param("id") offeringId: string,
    @Req() req,
  ) {
    return this.enrollmentsService.getOfferingEnrollmentsForInstructor(
      req.user.userId,
      offeringId,
    );
  }

  @Post("instructor/course-offerings/:id/grades")
  @Roles("INSTRUCTOR")
  uploadGrades(
    @Param("id") offeringId: string,
    @Body() dto: UploadGradesDto,
    @Req() req,
  ) {
    return this.enrollmentsService.uploadGrades(
      req.user.userId,
      offeringId,
      dto.grades,
    );
  }


    // ---------- STUDENT ACTIONS ----------

  @Patch("student/enrollments/:id/drop")
  @Roles("STUDENT")
  dropEnrollment(
    @Param("id") id: string,
    @Req() req,
  ) {
    return this.enrollmentsService.dropEnrollment(
      req.user.userId,
      id,
    );
  }

  @Patch("student/enrollments/:id/audit")
  @Roles("STUDENT")
  auditEnrollment(
    @Param("id") id: string,
    @Req() req,
  ) {
    return this.enrollmentsService.auditEnrollment(
      req.user.userId,
      id,
    );
  }

  @Get("course-offerings/:id/enrollments")
  @UseGuards(JwtAuthGuard)
  getUnifiedEnrollmentList(
    @Param("id") offeringId: string,
    @Req() req,
  ) {
    return this.enrollmentsService.getUnifiedEnrollmentList(
      {
        userId: req.user.userId,
        role: req.user.role,
      },
      offeringId,
    );
  }

}
