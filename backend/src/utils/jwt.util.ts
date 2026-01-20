import { JwtService } from "@nestjs/jwt";

export function signJwt(
  jwtService: JwtService,
  payload: { sub: string; role: string },
) {
  return jwtService.sign(payload);
}
