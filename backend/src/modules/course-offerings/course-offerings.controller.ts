import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CourseOfferingsService } from "./course-offerings.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Param, Patch } from "@nestjs/common";
import { RequestOfferingDto } from "./dto/request-offering.dto";

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseOfferingsController {
  constructor(
    private readonly courseOfferingsService: CourseOfferingsService,
  ) {}

  // ---------------- STUDENT ----------------
  @Get("student/course-offerings")
  @Roles("STUDENT")
  getStudentCourseOfferings(
    @Query("courseCode") courseCode?: string,
  ) {
    return this.courseOfferingsService.getForStudent(courseCode);
  }

  // ---------------- INSTRUCTOR ----------------
  @Get("instructor/course-offerings")
  @Roles("INSTRUCTOR")
  getInstructorCourseOfferings(@Req() req) {
    return this.courseOfferingsService.getForInstructor(req.user.userId);
  }

  // Grade distribution for students on completed offerings
  @Get("student/course-offerings/:id/grade-distribution")
  @Roles("STUDENT")
  getGradeDistribution(@Param("id") offeringId: string) {
    return this.courseOfferingsService.getGradeDistribution(offeringId);
  }

  @Post("instructor/course-offerings")
  @Roles("INSTRUCTOR")
  requestOffering(
    @Body() dto: RequestOfferingDto,
    @Req() req,
  ) {
    return this.courseOfferingsService.requestOffering(
      req.user.userId,
      dto,
    );
  }

  @Post("instructor/course-offerings/:id/finalize")
  @Roles("INSTRUCTOR")
  finalizeOffering(
    @Param("id") offeringId: string,
    @Req() req,
  ) {
    return this.courseOfferingsService.finalizeOffering(
      req.user.userId,
      offeringId,
    );
  }

  @Get("instructor/all-course-offerings")
  @Roles("INSTRUCTOR")
  getAllCourseOfferings() {
    return this.courseOfferingsService.getAllOfferings();
  }

  @Get("instructor/semesters")
  @Roles("INSTRUCTOR")
  getInstructorSemesters() {
    return this.courseOfferingsService.getInstructorSemesters();
  }

    // ---------------- ADMIN ----------------

    // View all pending offering requests
    @Get("admin/course-offerings")
    @Roles("ADMIN")
    getPendingOfferings() {
    return this.courseOfferingsService.getPendingOfferings();
    }

    // Approve one offering
    @Patch("admin/course-offerings/:id/approve")
    @Roles("ADMIN")
    approveOffering(@Param("id") id: string) {
    return this.courseOfferingsService.approveOffering(id);
    }

    // Reject one offering
    @Patch("admin/course-offerings/:id/reject")
    @Roles("ADMIN")
    rejectOffering(@Param("id") id: string) {
    return this.courseOfferingsService.rejectOffering(id);
    }

    // Withdraw an approved offering
    @Patch("admin/course-offerings/:id/withdraw")
    @Roles("ADMIN")
    withdrawOffering(@Param("id") id: string) {
    return this.courseOfferingsService.withdrawOffering(id);
    }


}
