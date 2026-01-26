import { IsArray, IsEnum, IsString } from "class-validator";

export enum BulkEnrollmentAction {
  APPROVE = "approve",
  REJECT = "reject",
}

export class BulkActionEnrollmentsDto {
  @IsArray()
  @IsString({ each: true })
  enrollmentIds: string[];

  @IsEnum(BulkEnrollmentAction)
  action: BulkEnrollmentAction;
}
