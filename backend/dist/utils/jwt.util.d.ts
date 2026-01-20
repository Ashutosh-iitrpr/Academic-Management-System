import { JwtService } from "@nestjs/jwt";
export declare function signJwt(jwtService: JwtService, payload: {
    sub: string;
    role: string;
}): string;
