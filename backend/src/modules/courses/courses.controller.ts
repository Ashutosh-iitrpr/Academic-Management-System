import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CoursesService } from "./courses.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ADMIN → create course
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post()
  createCourse(@Body() dto: CreateCourseDto) {
    return this.coursesService.createCourse(dto);
  }

  // ALL USERS → view catalog
  @UseGuards(JwtAuthGuard)
  @Get()
  getCourses() {
    return this.coursesService.getAllCourses();
  }
}
