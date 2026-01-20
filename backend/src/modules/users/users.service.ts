import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  async activateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        entryNumber: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
