import {
  ArrayNotEmpty,
  IsArray,
  IsString,
  Matches,
} from "class-validator";

export class RequestOfferingDto {
  @IsString()
  courseId: string;

  @IsString()
  semester: string;

  @IsString()
  timeSlot: string;

  @IsArray()
  @ArrayNotEmpty()
  @Matches(/^[A-Z]{3}$/, {
    each: true,
    message: "Each branch must be 3 uppercase letters",
  })
  allowedBranches: string[];
}
