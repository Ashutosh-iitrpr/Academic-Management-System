import { Injectable, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCourseDto } from "./dto/create-course.dto";

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async createCourse(dto: CreateCourseDto) {
    try {
      return await this.prisma.course.create({
        data: {
          code: dto.code,
          name: dto.name,
          credits: dto.credits,
        },
      });
    } catch (error) {
      throw new ConflictException("Course with this code already exists");
    }
  }

  async getAllCourses() {
    return this.prisma.course.findMany({
      orderBy: { code: "asc" },
    });
  }
}
