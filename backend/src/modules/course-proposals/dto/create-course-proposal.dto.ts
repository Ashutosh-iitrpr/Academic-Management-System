import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Matches } from "class-validator";

export class CreateCourseProposalDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsInt()
  @IsPositive()
  credits: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+-\d+-\d+-\d+$/, {
    message: "LTPSC must be in format like 3-0-0-3 (Lecture-Tutorial-Practical-Self Study)",
  })
  ltpsc: string;

   // Optional description to explain the course content
  @IsOptional()
  @IsString()
  description?: string;
}
