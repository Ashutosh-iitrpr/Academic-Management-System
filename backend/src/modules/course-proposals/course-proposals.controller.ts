import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CourseProposalsService } from "./course-proposals.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CreateCourseProposalDto } from "./dto/create-course-proposal.dto";

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseProposalsController {
  constructor(
    private readonly courseProposalsService: CourseProposalsService,
  ) {}

  // ---------------- INSTRUCTOR ----------------
  @Post("instructor/course-proposals")
  @Roles("INSTRUCTOR")
  createProposal(
    @Body() dto: CreateCourseProposalDto,
    @Req() req,
  ) {
    return this.courseProposalsService.createProposal(req.user.userId, dto);
  }

  @Get("instructor/course-proposals")
  @Roles("INSTRUCTOR")
  getInstructorProposals(@Req() req) {
    return this.courseProposalsService.getInstructorProposals(req.user.userId);
  }

  // ---------------- ADMIN ----------------
  @Get("admin/course-proposals")
  @Roles("ADMIN")
  getAllPendingProposals() {
    return this.courseProposalsService.getAllPendingProposals();
  }

  @Patch("admin/course-proposals/:id/approve")
  @Roles("ADMIN")
  approveProposal(@Param("id") id: string) {
    return this.courseProposalsService.approveProposal(id);
  }

  @Patch("admin/course-proposals/:id/reject")
  @Roles("ADMIN")
  rejectProposal(@Param("id") id: string) {
    return this.courseProposalsService.rejectProposal(id);
  }
}
