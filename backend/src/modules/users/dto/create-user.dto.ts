import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from "class-validator";

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(["STUDENT", "INSTRUCTOR", "ADMIN"])
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";

  @IsOptional()
  @Matches(/^[0-9]{4}[A-Z]{2,4}[0-9]+$/, {
    message:
      "Entry number must be like 2023CSB1289",
  })
  entryNumber?: string;

  @IsOptional()
  @IsString()
  department?: string; // Required for INSTRUCTOR role
}
