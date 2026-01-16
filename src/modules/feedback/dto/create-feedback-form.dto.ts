import { IsOptional, IsString } from "class-validator";

export class CreateFeedbackFormDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
