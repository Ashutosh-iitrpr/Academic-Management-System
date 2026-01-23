import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateCourseProposalDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsInt()
  @IsPositive()
  credits: number;

   // Optional description to explain the course content
  @IsOptional()
  @IsString()
  description?: string;
}
