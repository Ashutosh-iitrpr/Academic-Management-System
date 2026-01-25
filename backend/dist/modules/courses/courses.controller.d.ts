import { CoursesService } from "./courses.service";
import { CreateCourseDto } from "./dto/create-course.dto";
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    createCourse(dto: CreateCourseDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        code: string;
        credits: number;
        ltpsc: string | null;
        description: string | null;
    }>;
    getCourses(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        code: string;
        credits: number;
        ltpsc: string | null;
        description: string | null;
    }[]>;
}
