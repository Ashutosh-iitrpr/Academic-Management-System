import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  IsBoolean,
} from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Matches(/^[0-9]{4}[A-Z]{2,4}[0-9]+$/, {
    message: "Entry number must be like 2023CSB1289",
  })
  entryNumber?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsBoolean()
  isFacultyAdvisor?: boolean;
}
