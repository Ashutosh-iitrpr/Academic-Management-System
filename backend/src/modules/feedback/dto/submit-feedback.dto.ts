import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class SubmitFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  ratingContent: number;

  @IsInt()
  @Min(1)
  @Max(5)
  ratingTeaching: number;

  @IsInt()
  @Min(1)
  @Max(5)
  ratingEvaluation: number;

  @IsInt()
  @Min(1)
  @Max(5)
  ratingOverall: number;

  @IsOptional()
  @IsString()
  comments?: string;
}
