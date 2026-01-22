import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
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
    }>;
    updateDepartment(id: string, dto: {
        department: string;
    }): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        department: string | null;
        id: string;
    }>;
}
