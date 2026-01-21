export declare class CreateUserDto {
    name: string;
    email: string;
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
    entryNumber?: string;
}
