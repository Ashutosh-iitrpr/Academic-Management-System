import { Grade } from "@prisma/client";
declare class GradeItemDto {
    enrollmentId: string;
    grade: Grade;
}
export declare class UploadGradesDto {
    grades: GradeItemDto[];
}
export {};
