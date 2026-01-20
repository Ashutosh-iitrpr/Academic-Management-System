import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  // 1️⃣ Open (float) feedback form
  async openFeedbackForm(
    instructorId: string,
    courseOfferingId: string,
    dto: { title?: string; description?: string },
  ) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
    });

    if (!offering) {
      throw new NotFoundException("Course offering not found");
    }

    if (offering.instructorId !== instructorId) {
      throw new ForbiddenException(
        "You do not own this course offering",
      );
    }

    const openForm = await this.prisma.feedbackForm.findFirst({
      where: {
        courseOfferingId,
        isOpen: true,
      },
    });

    if (openForm) {
      throw new BadRequestException(
        "A feedback form is already open for this course",
      );
    }

    return this.prisma.feedbackForm.create({
      data: {
        courseOfferingId,
        instructorId,
        title: dto.title,
        description: dto.description,
      },
    });
  }

  // 2️⃣ Close feedback form
  async closeFeedbackForm(
    instructorId: string,
    formId: string,
  ) {
    const form = await this.prisma.feedbackForm.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException("Feedback form not found");
    }

    if (form.instructorId !== instructorId) {
      throw new ForbiddenException(
        "You do not own this feedback form",
      );
    }

    if (!form.isOpen) {
      throw new BadRequestException("Feedback form already closed");
    }

    return this.prisma.feedbackForm.update({
      where: { id: formId },
      data: {
        isOpen: false,
        closedAt: new Date(),
      },
    });
  }

  // 3️⃣ View aggregated feedback results
  async getFeedbackResults(
    instructorId: string,
    courseOfferingId: string,
  ) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
    });

    if (!offering) {
      throw new NotFoundException("Course offering not found");
    }

    if (offering.instructorId !== instructorId) {
      throw new ForbiddenException(
        "You do not own this course offering",
      );
    }

    const forms = await this.prisma.feedbackForm.findMany({
      where: { courseOfferingId },
      include: {
        responses: true,
      },
    });

    if (forms.length === 0) {
      return {
        responses: 0,
        averages: null,
        comments: [],
      };
    }

    let count = 0;
    let totals = {
      ratingContent: 0,
      ratingTeaching: 0,
      ratingEvaluation: 0,
      ratingOverall: 0,
    };

    const comments: string[] = [];

    for (const form of forms) {
      for (const r of form.responses) {
        count++;
        totals.ratingContent += r.ratingContent;
        totals.ratingTeaching += r.ratingTeaching;
        totals.ratingEvaluation += r.ratingEvaluation;
        totals.ratingOverall += r.ratingOverall;

        if (r.comments) {
          comments.push(r.comments);
        }
      }
    }

    return {
      responses: count,
      averages:
        count === 0
          ? null
          : {
              ratingContent: (
                totals.ratingContent / count
              ).toFixed(2),
              ratingTeaching: (
                totals.ratingTeaching / count
              ).toFixed(2),
              ratingEvaluation: (
                totals.ratingEvaluation / count
              ).toFixed(2),
              ratingOverall: (
                totals.ratingOverall / count
              ).toFixed(2),
            },
      comments,
    };
  }

  async listFeedbackForms(
    instructorId: string,
    courseOfferingId: string,
  ) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
    });

    if (!offering) {
      throw new NotFoundException("Course offering not found");
    }

    if (offering.instructorId !== instructorId) {
      throw new ForbiddenException(
        "You do not own this course offering",
      );
    }

    return this.prisma.feedbackForm.findMany({
      where: { courseOfferingId },
      select: {
        id: true,
        title: true,
        description: true,
        isOpen: true,
        createdAt: true,
        closedAt: true,
        _count: {
          select: { responses: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAvailableFeedbackForms(studentId: string) {
    return this.prisma.feedbackForm.findMany({
      where: {
        isOpen: true,
        courseOffering: {
          enrollments: {
            some: {
              studentId,
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        courseOffering: {
          select: {
            semester: true,
            course: {
              select: {
                code: true,
                name: true,
              },
            },
            instructor: {
              select: { name: true },
            },
          },
        },
      },
    });
  }

  async submitFeedback(
    studentId: string,
    feedbackFormId: string,
    dto: {
      ratingContent: number;
      ratingTeaching: number;
      ratingEvaluation: number;
      ratingOverall: number;
      comments?: string;
    },
  ) {
    // 1️⃣ Fetch feedback form
    const form = await this.prisma.feedbackForm.findUnique({
      where: { id: feedbackFormId },
      include: {
        courseOffering: {
          include: {
            enrollments: true,
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException("Feedback form not found");
    }

    if (!form.isOpen) {
      throw new BadRequestException("Feedback form is closed");
    }

    // 2️⃣ Check enrollment
    const isEnrolled = form.courseOffering.enrollments.some(
      (e) => e.studentId === studentId,
    );

    if (!isEnrolled) {
      throw new ForbiddenException(
        "You are not enrolled in this course",
      );
    }

    // 3️⃣ Prevent duplicate submission
    const existing = await this.prisma.courseFeedback.findFirst({
      where: {
        feedbackFormId,
        studentId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        "Feedback already submitted",
      );
    }

    // 4️⃣ Create feedback
    return this.prisma.courseFeedback.create({
      data: {
        feedbackFormId,
        studentId,
        ratingContent: dto.ratingContent,
        ratingTeaching: dto.ratingTeaching,
        ratingEvaluation: dto.ratingEvaluation,
        ratingOverall: dto.ratingOverall,
        comments: dto.comments,
      },
    });
  }

  async getFeedbackResultsForForm(
    instructorId: string,
    formId: string,
  ) {
    const form = await this.prisma.feedbackForm.findUnique({
      where: { id: formId },
      include: {
        responses: true,
        courseOffering: true,
      },
    });

    if (!form) {
      throw new NotFoundException("Feedback form not found");
    }

    if (form.instructorId !== instructorId) {
      throw new ForbiddenException(
        "You do not own this feedback form",
      );
    }

    const responses = form.responses;

    if (responses.length === 0) {
      return {
        responses: 0,
        averages: null,
        comments: [],
      };
    }

    const totals = {
      ratingContent: 0,
      ratingTeaching: 0,
      ratingEvaluation: 0,
      ratingOverall: 0,
    };

    const comments: string[] = [];

    for (const r of responses) {
      totals.ratingContent += r.ratingContent;
      totals.ratingTeaching += r.ratingTeaching;
      totals.ratingEvaluation += r.ratingEvaluation;
      totals.ratingOverall += r.ratingOverall;

      if (r.comments) {
        comments.push(r.comments);
      }
    }

    const count = responses.length;

    return {
      form: {
        id: form.id,
        title: form.title,
        createdAt: form.createdAt,
        closedAt: form.closedAt,
      },
      responses: count,
      averages: {
        ratingContent: (totals.ratingContent / count).toFixed(2),
        ratingTeaching: (totals.ratingTeaching / count).toFixed(2),
        ratingEvaluation: (totals.ratingEvaluation / count).toFixed(2),
        ratingOverall: (totals.ratingOverall / count).toFixed(2),
      },
      comments,
    };
  }

  async getFeedbackResultsByOffering(
    instructorId: string,
    courseOfferingId: string,
  ) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
    });

    if (!offering) {
      throw new NotFoundException("Course offering not found");
    }

    if (offering.instructorId !== instructorId) {
      throw new ForbiddenException(
        "You do not own this course offering",
      );
    }

    const forms = await this.prisma.feedbackForm.findMany({
      where: { courseOfferingId },
      include: {
        responses: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return forms.map(form => {
      const responses = form.responses;
      
      if (responses.length === 0) {
        return {
          formId: form.id,
          title: form.title,
          isOpen: form.isOpen,
          responses: 0,
          averages: null,
        };
      }

      const totals = {
        ratingContent: 0,
        ratingTeaching: 0,
        ratingEvaluation: 0,
        ratingOverall: 0,
      };

      for (const r of responses) {
        totals.ratingContent += r.ratingContent;
        totals.ratingTeaching += r.ratingTeaching;
        totals.ratingEvaluation += r.ratingEvaluation;
        totals.ratingOverall += r.ratingOverall;
      }

      const count = responses.length;

      return {
        formId: form.id,
        title: form.title,
        isOpen: form.isOpen,
        createdAt: form.createdAt,
        closedAt: form.closedAt,
        responses: count,
        averages: {
          ratingContent: (totals.ratingContent / count).toFixed(2),
          ratingTeaching: (totals.ratingTeaching / count).toFixed(2),
          ratingEvaluation: (totals.ratingEvaluation / count).toFixed(2),
          ratingOverall: (totals.ratingOverall / count).toFixed(2),
        },
      };
    });
  }


}
