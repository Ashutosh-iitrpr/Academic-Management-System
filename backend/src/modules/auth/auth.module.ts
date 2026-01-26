import { Module } from "@nestjs/common";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtStrategy } from "src/common/strategies/jwt.strategy";
import { EmailService } from "src/common/services/email.service";

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>("JWT_SECRET");
        const expiresInRaw = config.get<string>("JWT_EXPIRES_IN");
        const expiresIn = expiresInRaw ? Number(expiresInRaw) : undefined;

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, EmailService],
})
export class AuthModule {}
