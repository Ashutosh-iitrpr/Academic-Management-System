import { IsInt, IsNotEmpty, IsString, Matches, Min } from "class-validator";

export class CreateCourseDto {
  @IsString()
  @Matches(/^[A-Z]{2}[0-9]{3}$/, {
    message: "Course code must be like MA202",
  })
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  credits: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+-\d+-\d+-\d+$/, {
    message: "LTPSC must be in format like 3-0-0-3 (Lecture-Tutorial-Practical-Self Study)",
  })
  ltpsc: string;
}
