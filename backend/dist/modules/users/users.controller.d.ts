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
        id: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    getAllUsers(): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        entryNumber: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    deactivate(id: string): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        entryNumber: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    activate(id: string): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        entryNumber: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }>;
}
