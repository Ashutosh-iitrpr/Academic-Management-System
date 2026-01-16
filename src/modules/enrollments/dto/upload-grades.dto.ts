import {
  IsArray,
  IsEnum,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { Grade } from "@prisma/client";

class GradeItemDto {
  @IsString()
  enrollmentId: string;

  @IsEnum(Grade)
  grade: Grade;
}

export class UploadGradesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeItemDto)
  grades: GradeItemDto[];
}
