import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
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
    getAllUsers(): Promise<any>;
    deactivate(id: string): Promise<{
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
    activate(id: string): Promise<{
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
    updateDepartment(id: string, dto: {
        department: string;
    }): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        department: string | null;
        id: string;
        isFacultyAdvisor: boolean;
    }>;
    updateUser(id: string, dto: any): Promise<{
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
}
