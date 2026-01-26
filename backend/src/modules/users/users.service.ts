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

      // 🔒 INSTRUCTOR must have department
      if (dto.role === "INSTRUCTOR" && !dto.department) {
        throw new BadRequestException(
          "Department is required for instructors",
        );
      }

      // 🔒 Non-students must NOT have entryNumber
      if (dto.role !== "STUDENT" && dto.entryNumber) {
        throw new BadRequestException(
          "Only students can have entry numbers",
        );
      }

      try {
        const createdUser = await this.prisma.user.create({
          data: {
            name: dto.name,
            email: dto.email,
            role: dto.role,
            entryNumber:
              dto.role === "STUDENT" ? dto.entryNumber : null,
            department: dto.department,
            isFacultyAdvisor: false, // Explicitly set to false for new users
          },
        });

        // Return user with all fields including isFacultyAdvisor
        return {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          entryNumber: createdUser.entryNumber,
          department: createdUser.department,
          isFacultyAdvisor: createdUser.isFacultyAdvisor,
          isActive: createdUser.isActive,
          createdAt: createdUser.createdAt,
        };
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

  async updateUserDepartment(userId: string, department: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.role !== "INSTRUCTOR") {
      throw new BadRequestException("Only instructors can have departments");
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { department },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isFacultyAdvisor: true,
      },
    });
  }

  async updateUser(userId: string, updateData: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Build update object
    const dataToUpdate: any = {};

    if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
    if (updateData.email !== undefined) dataToUpdate.email = updateData.email;
    if (updateData.department !== undefined) dataToUpdate.department = updateData.department;
    if (updateData.entryNumber !== undefined) dataToUpdate.entryNumber = updateData.entryNumber;
    
    if (updateData.isFacultyAdvisor !== undefined) {
      if (user.role !== 'INSTRUCTOR') {
        throw new BadRequestException('Only instructors can be faculty advisors');
      }
      dataToUpdate.isFacultyAdvisor = updateData.isFacultyAdvisor;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      entryNumber: updatedUser.entryNumber,
      department: updatedUser.department,
      isFacultyAdvisor: updatedUser.isFacultyAdvisor,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        entryNumber: true,
        department: true,
        isFacultyAdvisor: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }) as any;
  }
}
