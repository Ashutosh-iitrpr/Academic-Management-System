import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { generateOtp, hashOtp } from "../../utils/otp.util";
import { sendOtpEmail } from "../../utils/mail.util";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // =========================
  // 1️⃣ REQUEST OTP
  // =========================
  async requestOtp(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.isActive) {
      throw new ForbiddenException("Account is deactivated");
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.otpToken.create({
      data: {
        userId: user.id,
        otpHash,
        expiresAt,
      },
    });

    // For now this logs to console
    await sendOtpEmail(user.email, otp);

    return {
      message: "OTP sent to registered email",
    };
  }

  // =========================
  // 2️⃣ VERIFY OTP + LOGIN
  // =========================
  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.isActive) {
      throw new ForbiddenException("Account is deactivated");
    }

    const latestOtp = await this.prisma.otpToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!latestOtp) {
      throw new UnauthorizedException("OTP not requested");
    }

    if (latestOtp.expiresAt < new Date()) {
      throw new UnauthorizedException("OTP expired");
    }

    const incomingOtpHash = hashOtp(otp);

    if (incomingOtpHash !== latestOtp.otpHash) {
      throw new UnauthorizedException("Invalid OTP");
    }

    // OTP is valid → delete it
    await this.prisma.otpToken.delete({
      where: { id: latestOtp.id },
    });

    // Issue JWT
    const accessToken = this.jwtService.sign({
      sub: user.id,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        entryNumber: user.entryNumber,
      },
    };
  }

  // =========================
  // 3️⃣ GET CURRENT USER
  // =========================
  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        entryNumber: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Extract branch from entry number if student
    // Entry number format: YYYYBBBXXXX (Year-BranchCode-Serial)
    let branch: string | null = null;
    if (user.role === "STUDENT" && user.entryNumber) {
      branch = user.entryNumber.substring(4, 7); // Extract branch code
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      entryNumber: user.entryNumber,
      branch: branch,
    };
  }
}
