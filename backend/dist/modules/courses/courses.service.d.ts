import { PrismaService } from "../../prisma/prisma.service";
import { CreateCourseDto } from "./dto/create-course.dto";
export declare class CoursesService {
    private prisma;
    constructor(prisma: PrismaService);
    createCourse(dto: CreateCourseDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        code: string;
        credits: number;
    }>;
    getAllCourses(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        code: string;
        credits: number;
    }[]>;
}
