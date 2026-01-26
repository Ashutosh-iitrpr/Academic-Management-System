import { PrismaService } from "../../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    createUser(dto: CreateUserDto): Promise<{
        id: string;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        entryNumber: string | null;
        department: string | null;
        isFacultyAdvisor: boolean;
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
        isFacultyAdvisor: boolean;
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
        isFacultyAdvisor: boolean;
    }>;
    updateUserDepartment(userId: string, department: string): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        department: string | null;
        id: string;
        isFacultyAdvisor: boolean;
    }>;
    updateUser(userId: string, updateData: any): Promise<{
        id: string;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        entryNumber: string | null;
        department: string | null;
        isFacultyAdvisor: boolean;
        isActive: boolean;
        createdAt: Date;
    }>;
    getAllUsers(): Promise<any>;
}
