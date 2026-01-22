"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const common_2 = require("@nestjs/common");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createUser(dto) {
        if (dto.role === "STUDENT" && !dto.entryNumber) {
            throw new common_1.BadRequestException("Entry number is required for students");
        }
        if (dto.role === "INSTRUCTOR" && !dto.department) {
            throw new common_1.BadRequestException("Department is required for instructors");
        }
        if (dto.role !== "STUDENT" && dto.entryNumber) {
            throw new common_1.BadRequestException("Only students can have entry numbers");
        }
        try {
            return await this.prisma.user.create({
                data: {
                    name: dto.name,
                    email: dto.email,
                    role: dto.role,
                    entryNumber: dto.role === "STUDENT" ? dto.entryNumber : null,
                    department: dto.department,
                },
            });
        }
        catch (error) {
            throw new common_2.ConflictException("User with this email or entry number already exists");
        }
    }
    async deactivateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: { isActive: false },
        });
    }
    async activateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: { isActive: true },
        });
    }
    async updateUserDepartment(userId, department) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        if (user.role !== "INSTRUCTOR") {
            throw new common_1.BadRequestException("Only instructors can have departments");
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
            },
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
                department: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map