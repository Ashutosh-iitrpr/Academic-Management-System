import { PrismaService } from "../../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    createUser(dto: CreateUserDto): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        entryNumber: string | null;
        department: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    deactivateUser(userId: string): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        entryNumber: string | null;
        department: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    activateUser(userId: string): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        entryNumber: string | null;
        department: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    updateUserDepartment(userId: string, department: string): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        department: string | null;
        id: string;
    }>;
    getAllUsers(): Promise<any>;
}
