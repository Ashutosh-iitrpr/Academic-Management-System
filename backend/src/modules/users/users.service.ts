import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { Role } from "./enums/role.enum";
import {ConflictException} from "@nestjs/common";
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}


    async createUser(dto: CreateUserDto) {
      // 🔒 STUDENT must have entryNumber
      if (dto.role === "STUDENT" && !dto.entryNumber) {
        throw new BadRequestException(
          "Entry number is required for students",
        );
      }

      // 🔒 Non-students must NOT have entryNumber
      if (dto.role !== "STUDENT" && dto.entryNumber) {
        throw new BadRequestException(
          "Only students can have entry numbers",
        );
      }

      try {
        return await this.prisma.user.create({
          data: {
            name: dto.name,
            email: dto.email,
            role: dto.role,
            entryNumber:
              dto.role === "STUDENT" ? dto.entryNumber : null,
          },
        });
      } catch (error) {
        throw new ConflictException(
          "User with this email or entry number already exists",
        );
      }
    }


  async deactivateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }
}
