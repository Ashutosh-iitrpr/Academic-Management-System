import { IsEnum, IsString } from "class-validator";
import { EnrollmentType } from "@prisma/client";

export class RequestEnrollmentDto {
  @IsString()
  courseOfferingId: string;

  @IsEnum(EnrollmentType)
  enrollmentType: EnrollmentType;
}
