import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  Matches,
} from "class-validator";

export class RequestOfferingDto {
  @IsOptional()
  @IsString()
  courseId?: string; // kept for backward compatibility

  @IsOptional()
  @IsString()
  courseCode?: string; // preferred input for existing courses

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
