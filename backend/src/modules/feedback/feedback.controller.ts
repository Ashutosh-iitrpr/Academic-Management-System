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
import { FeedbackService } from "./feedback.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CreateFeedbackFormDto } from "./dto/create-feedback-form.dto";
import { SubmitFeedbackDto } from "./dto/submit-feedback.dto";
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedbackController {
  constructor(
    private readonly feedbackService: FeedbackService,
  ) {}

  // 1️⃣ Instructor opens feedback
  @Post("instructor/course-offerings/:id/feedback-forms")
  @Roles("INSTRUCTOR")
  openFeedback(
    @Param("id") courseOfferingId: string,
    @Body() dto: CreateFeedbackFormDto,
    @Req() req,
  ) {
    return this.feedbackService.openFeedbackForm(
      req.user.userId,
      courseOfferingId,
      dto,
    );
  }

  // 2️⃣ Instructor closes feedback
  @Patch("instructor/feedback-forms/:id/close")
  @Roles("INSTRUCTOR")
  closeFeedback(
    @Param("id") formId: string,
    @Req() req,
  ) {
    return this.feedbackService.closeFeedbackForm(
      req.user.userId,
      formId,
    );
  }


  @Get("instructor/course-offerings/:id/feedback-forms")
  @Roles("INSTRUCTOR")
  listFeedbackForms(
    @Param("id") courseOfferingId: string,
    @Req() req,
  ) {
    return this.feedbackService.listFeedbackForms(
      req.user.userId,
      courseOfferingId,
    );
  }

  @Get("instructor/feedback-forms/:id/results")
  @Roles("INSTRUCTOR")
  getFeedbackResults(
    @Param("id") formId: string,
    @Req() req,
  ) {
    return this.feedbackService.getFeedbackResultsForForm(
      req.user.userId,
      formId,
    );
  }

  @Get("instructor/course-offerings/:id/feedback-results")
  @Roles("INSTRUCTOR")
  getFeedbackResultsByOffering(
    @Param("id") courseOfferingId: string,
    @Req() req,
  ) {
    return this.feedbackService.getFeedbackResultsByOffering(
      req.user.userId,
      courseOfferingId,
    );
  }


  @Get("student/feedback")
  @Roles("STUDENT")
  getAvailableFeedback(@Req() req) {
    return this.feedbackService.getAvailableFeedbackForms(
      req.user.userId,
    );
  }

  @Post("student/feedback/:formId")
  @Roles("STUDENT")
  submitFeedback(
    @Param("formId") formId: string,
    @Body() dto: SubmitFeedbackDto,
    @Req() req,
  ) {
    return this.feedbackService.submitFeedback(
      req.user.userId,
      formId,
      dto,
    );
  }

}
