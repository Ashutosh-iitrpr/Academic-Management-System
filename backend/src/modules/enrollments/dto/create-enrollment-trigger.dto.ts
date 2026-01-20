import { IsEnum, IsInt, IsString, Matches } from "class-validator";
import { EnrollmentType } from "@prisma/client";

export class CreateEnrollmentTriggerDto {
  @IsString()
  courseOfferingId: string;

  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: "Branch code must be 3 uppercase letters",
  })
  branchCode: string;

  @IsInt()
  batchYear: number;

  @IsEnum(EnrollmentType)
  enrollmentType: EnrollmentType;
}
